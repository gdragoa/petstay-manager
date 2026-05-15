const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { readDb, findById, updateOne, DATA_DIR, assertInsideDataDir } = require('../utils/db');
const { generateHash } = require('../utils/contractHash');
const { generateContractPdf } = require('../utils/pdfGenerator');

// Max base64 payload ~3MB (covers a 2MB PNG with base64 overhead)
const MAX_SIG_BYTES = 3 * 1024 * 1024;

function getContractFull(contract) {
  const db = readDb();
  const booking = findById('bookings', contract.booking_id);
  const animal = booking ? findById('animals', booking.animal_id) : null;
  const tutor = booking ? findById('tutors', booking.tutor_id) : null;
  return { contract, booking, animal, tutor, settings: db.settings };
}

async function checkExpiry(contract) {
  if (contract.data_expiracao && new Date() > new Date(contract.data_expiracao)) {
    // Awaited — status must be persisted before responding
    await updateOne('contracts', contract.id, { status: 'expirado' });
    return { expired: true };
  }
  if (contract.status === 'assinado') return { signed: true };
  if (contract.status === 'expirado') return { expired: true };
  return {};
}

function resolvePdfPath(relativePath) {
  const full = path.join(DATA_DIR, relativePath);
  assertInsideDataDir(full);
  return full;
}

// Admin: get by ID
router.get('/:id', (req, res) => {
  const contract = findById('contracts', req.params.id);
  if (!contract) return res.status(404).json({ success: false, error: 'Contract not found', code: 'NOT_FOUND' });
  res.json({ success: true, data: getContractFull(contract) });
});

// Public: get by token
router.get('/token/:token', async (req, res, next) => {
  try {
    const db = readDb();
    const contract = db.contracts.find(c => c.token_unico === req.params.token);
    if (!contract) return res.status(404).json({ success: false, error: 'Invalid token', code: 'INVALID_TOKEN' });

    const state = await checkExpiry(contract);
    if (state.expired) return res.json({ success: false, error: 'Contract expired', code: 'TOKEN_EXPIRED' });
    if (state.signed) return res.json({ success: false, error: 'Contract already signed', code: 'ALREADY_SIGNED' });

    if (contract.status === 'gerado') {
      await updateOne('contracts', contract.id, {
        status: 'visualizado',
        data_visualizacao: new Date().toISOString(),
      });
    }

    res.json({ success: true, data: getContractFull(contract) });
  } catch (err) { next(err); }
});

// Signature endpoint needs a larger body limit (base64 PNG, max ~3MB)
const signBodyParser = express.json({ limit: '4mb' });

// Public: sign contract
router.post('/sign/:token', signBodyParser, async (req, res, next) => {
  try {
    const db = readDb();
    const contract = db.contracts.find(c => c.token_unico === req.params.token);
    if (!contract) return res.status(404).json({ success: false, error: 'Invalid token', code: 'INVALID_TOKEN' });

    const state = await checkExpiry(contract);
    if (state.expired) return res.status(410).json({ success: false, error: 'Contract expired', code: 'TOKEN_EXPIRED' });
    if (state.signed) return res.status(409).json({ success: false, error: 'Contract already signed', code: 'ALREADY_SIGNED' });

    const { assinatura_base64, nome_digitado, aceite_termos } = req.body;

    if (!aceite_termos) return res.status(400).json({ success: false, error: 'Terms not accepted', code: 'TERMS_NOT_ACCEPTED' });
    if (!nome_digitado || nome_digitado.trim().length < 3) return res.status(400).json({ success: false, error: 'Name required (min 3 chars)', code: 'NAME_REQUIRED' });
    if (!assinatura_base64) return res.status(400).json({ success: false, error: 'Signature required', code: 'SIGNATURE_REQUIRED' });

    // Validate base64 payload size before decoding
    if (assinatura_base64.length > MAX_SIG_BYTES) {
      return res.status(413).json({ success: false, error: 'Signature file too large', code: 'PAYLOAD_TOO_LARGE' });
    }

    // Strip data URI prefix and validate it was a PNG
    if (!assinatura_base64.startsWith('data:image/png;base64,')) {
      return res.status(400).json({ success: false, error: 'Signature must be PNG', code: 'INVALID_SIGNATURE_FORMAT' });
    }

    const base64Data = assinatura_base64.slice('data:image/png;base64,'.length);
    const sigBuffer = Buffer.from(base64Data, 'base64');

    // Verify PNG magic bytes (89 50 4E 47)
    if (sigBuffer.length < 4 ||
        sigBuffer[0] !== 0x89 || sigBuffer[1] !== 0x50 ||
        sigBuffer[2] !== 0x4E || sigBuffer[3] !== 0x47) {
      return res.status(400).json({ success: false, error: 'Invalid PNG signature', code: 'INVALID_SIGNATURE_FORMAT' });
    }

    const sigFilename = `contrato_${contract.id}_sig.png`;
    const sigPath = path.join(DATA_DIR, 'uploads', 'signatures', sigFilename);
    assertInsideDataDir(sigPath);
    fs.writeFileSync(sigPath, sigBuffer);

    // Use req.ip which respects app.set('trust proxy') — avoids X-Forwarded-For spoofing
    // when not behind a trusted proxy
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const timestamp = new Date().toISOString();
    const hash = generateHash(contract.token_unico, nome_digitado.trim(), timestamp, ip);

    await updateOne('contracts', contract.id, {
      status: 'assinado',
      data_assinatura: timestamp,
      assinatura_path: `uploads/signatures/${sigFilename}`,
      nome_digitado: nome_digitado.trim(),
      aceite_termos: true,
      ip_assinante: ip,
      user_agent: userAgent,
      hash_verificacao: hash,
    });

    const pdfPath = await generateContractPdf(contract.id, 'final');
    res.json({ success: true, data: { hash, pdf_path: pdfPath } });
  } catch (err) { next(err); }
});

// Admin: resend (regenerate token)
router.post('/:id/resend', async (req, res, next) => {
  try {
    const contract = findById('contracts', req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found', code: 'NOT_FOUND' });
    if (contract.status === 'assinado') return res.status(409).json({ success: false, error: 'Contract already signed', code: 'ALREADY_SIGNED' });

    const settings = readDb().settings;
    const validadeHoras = settings.contrato_validade_horas;
    const dataExpiracao = validadeHoras
      ? new Date(Date.now() + validadeHoras * 3_600_000).toISOString()
      : null;

    const updated = await updateOne('contracts', req.params.id, {
      token_unico: uuidv4(),
      status: 'gerado',
      data_geracao: new Date().toISOString(),
      data_expiracao: dataExpiracao,
      data_visualizacao: null,
    });

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// Admin: hotel owner signs the contract
router.post('/:id/sign-hotel', async (req, res, next) => {
  try {
    const contract = findById('contracts', req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found', code: 'NOT_FOUND' });

    const { assinatura_base64, nome_assinante } = req.body;
    if (!assinatura_base64) return res.status(400).json({ success: false, error: 'Signature required', code: 'SIGNATURE_REQUIRED' });
    if (!nome_assinante || nome_assinante.trim().length < 2) return res.status(400).json({ success: false, error: 'Name required', code: 'NAME_REQUIRED' });

    if (assinatura_base64.length > MAX_SIG_BYTES) return res.status(413).json({ success: false, error: 'Signature too large', code: 'PAYLOAD_TOO_LARGE' });
    if (!assinatura_base64.startsWith('data:image/png;base64,')) return res.status(400).json({ success: false, error: 'Signature must be PNG', code: 'INVALID_SIGNATURE_FORMAT' });

    const base64Data = assinatura_base64.slice('data:image/png;base64,'.length);
    const sigBuffer = Buffer.from(base64Data, 'base64');
    if (sigBuffer.length < 4 || sigBuffer[0] !== 0x89 || sigBuffer[1] !== 0x50 || sigBuffer[2] !== 0x4E || sigBuffer[3] !== 0x47) {
      return res.status(400).json({ success: false, error: 'Invalid PNG', code: 'INVALID_SIGNATURE_FORMAT' });
    }

    const sigFilename = `contrato_${contract.id}_hotel_sig.png`;
    const sigPath = path.join(DATA_DIR, 'uploads', 'signatures', sigFilename);
    assertInsideDataDir(sigPath);
    fs.writeFileSync(sigPath, sigBuffer);

    const updated = await updateOne('contracts', contract.id, {
      assinatura_hotel_path: `uploads/signatures/${sigFilename}`,
      nome_hotel_assinante: nome_assinante.trim(),
      data_assinatura_hotel: new Date().toISOString(),
    });

    // Regenerate final PDF with hotel signature if contract is already signed
    if (contract.status === 'assinado') {
      await generateContractPdf(contract.id, 'final');
    }

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// Admin: download draft PDF
router.get('/:id/pdf/rascunho', async (req, res, next) => {
  try {
    const contract = findById('contracts', req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found', code: 'NOT_FOUND' });

    let pdfFullPath = contract.pdf_rascunho_path
      ? resolvePdfPath(contract.pdf_rascunho_path)
      : null;

    if (!pdfFullPath || !fs.existsSync(pdfFullPath)) {
      const rel = await generateContractPdf(req.params.id, 'rascunho');
      pdfFullPath = resolvePdfPath(rel);
    }

    res.download(pdfFullPath, `contrato_${req.params.id}_rascunho.pdf`);
  } catch (err) { next(err); }
});

// Admin + client: download final PDF
router.get('/:id/pdf/final', async (req, res, next) => {
  try {
    const contract = findById('contracts', req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found', code: 'NOT_FOUND' });
    if (contract.status !== 'assinado') return res.status(400).json({ success: false, error: 'Contract not signed yet', code: 'NOT_SIGNED' });

    let pdfFullPath = contract.pdf_final_path
      ? resolvePdfPath(contract.pdf_final_path)
      : null;

    if (!pdfFullPath || !fs.existsSync(pdfFullPath)) {
      const rel = await generateContractPdf(req.params.id, 'final');
      pdfFullPath = resolvePdfPath(rel);
    }

    res.download(pdfFullPath, `contrato_${req.params.id}_final.pdf`);
  } catch (err) { next(err); }
});

// Public: verify authenticity by hash
router.get('/verify/:hash', (req, res) => {
  const db = readDb();
  // Only consider hash if it's a 64-char hex string (SHA-256)
  if (!/^[a-f0-9]{64}$/.test(req.params.hash)) {
    return res.json({ success: true, data: { valid: false } });
  }
  const contract = db.contracts.find(c => c.hash_verificacao === req.params.hash);
  if (!contract) return res.json({ success: true, data: { valid: false } });

  const booking = findById('bookings', contract.booking_id);
  const animal = booking ? findById('animals', booking.animal_id) : null;

  res.json({
    success: true,
    data: {
      valid: true,
      estabelecimento: db.settings.nome_estabelecimento,
      pet: animal?.nome || '—',
      assinado_por: contract.nome_digitado,
      signed_at: contract.data_assinatura,
    },
  });
});

module.exports = router;
