const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const { readDb, updateSettings, DATA_DIR, assertInsideDataDir } = require('../utils/db');
const { backupDb, listBackups, restoreBackup } = require('../utils/backup');
const { logoUploader } = require('../middleware/upload');

// Backup filenames must match this pattern — prevents path traversal
const BACKUP_FNAME_RE = /^db_[\w\-]+\.json$/;

router.get('/', (_req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.settings });
});

router.put('/', async (req, res, next) => {
  try {
    // Strip fields that must not be set via this endpoint
    const { logo_path: _lp, onboarding_completo: _oc, ...safe } = req.body;
    const settings = await updateSettings({ ...safe, ...(req.body.onboarding_completo !== undefined ? { onboarding_completo: req.body.onboarding_completo } : {}) });
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
});

router.post('/logo', logoUploader.single('logo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded', code: 'NO_FILE' });

    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'Invalid file extension', code: 'INVALID_FILE_TYPE' });
    }

    const destDir = path.join(DATA_DIR, 'uploads', 'logo');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const destPath = path.join(destDir, `logo${ext}`);
    assertInsideDataDir(destPath);

    if (req.file.path !== destPath) fs.renameSync(req.file.path, destPath);

    const logo_path = `uploads/logo/logo${ext}`;
    await updateSettings({ logo_path });
    res.json({ success: true, data: { logo_path } });
  } catch (err) { next(err); }
});

router.get('/logo', (req, res) => {
  const db = readDb();
  const logoPath = db.settings?.logo_path;
  if (!logoPath) return res.status(404).json({ success: false, error: 'No logo set', code: 'NOT_FOUND' });

  // Validate stored path stays inside DATA_DIR before serving
  const fullPath = path.join(DATA_DIR, logoPath);
  try { assertInsideDataDir(fullPath); } catch {
    return res.status(400).json({ success: false, error: 'Invalid logo path', code: 'INVALID_PATH' });
  }

  if (!fs.existsSync(fullPath)) return res.status(404).json({ success: false, error: 'Logo file not found', code: 'NOT_FOUND' });
  res.sendFile(fullPath);
});

router.post('/backup', (_req, res, next) => {
  try {
    const fname = backupDb();
    res.json({ success: true, data: { fname } });
  } catch (err) { next(err); }
});

router.get('/backup/list', (_req, res) => {
  res.json({ success: true, data: listBackups() });
});

router.post('/backup/restore/:fname', (req, res, next) => {
  try {
    const fname = req.params.fname;

    // Strict filename validation — no path traversal
    if (!BACKUP_FNAME_RE.test(fname) || fname.includes('..')) {
      return res.status(400).json({ success: false, error: 'Invalid backup filename', code: 'INVALID_FILE' });
    }

    restoreBackup(fname);
    res.json({ success: true, data: { restored: fname } });
  } catch (err) {
    next(Object.assign(err, { status: 404, code: 'NOT_FOUND' }));
  }
});

// POST /api/settings/assinatura — save hotel representative signature (base64 PNG)
router.post('/assinatura', async (req, res, next) => {
  try {
    const { assinatura_base64, nome_representante } = req.body;

    if (!nome_representante || nome_representante.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Nome do representante obrigatorio', code: 'NAME_REQUIRED' });
    }
    if (!assinatura_base64) {
      return res.status(400).json({ success: false, error: 'Assinatura obrigatoria', code: 'SIGNATURE_REQUIRED' });
    }
    if (assinatura_base64.length > 3 * 1024 * 1024) {
      return res.status(413).json({ success: false, error: 'Assinatura muito grande', code: 'PAYLOAD_TOO_LARGE' });
    }
    if (!assinatura_base64.startsWith('data:image/png;base64,')) {
      return res.status(400).json({ success: false, error: 'Formato invalido', code: 'INVALID_SIGNATURE_FORMAT' });
    }

    const base64Data = assinatura_base64.slice('data:image/png;base64,'.length);
    const buf = Buffer.from(base64Data, 'base64');
    if (buf.length < 4 || buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4E || buf[3] !== 0x47) {
      return res.status(400).json({ success: false, error: 'PNG invalido', code: 'INVALID_SIGNATURE_FORMAT' });
    }

    const sigDir = path.join(DATA_DIR, 'uploads', 'signatures');
    if (!fs.existsSync(sigDir)) fs.mkdirSync(sigDir, { recursive: true });
    const sigPath = path.join(sigDir, 'hotel_sig.png');
    assertInsideDataDir(sigPath);
    fs.writeFileSync(sigPath, buf);

    const assinatura_hotel_path = 'uploads/signatures/hotel_sig.png';
    const settings = await updateSettings({
      assinatura_hotel_path,
      nome_hotel_assinante: nome_representante.trim(),
    });
    res.json({ success: true, data: { assinatura_hotel_path, nome_hotel_assinante: settings.nome_hotel_assinante } });
  } catch (err) { next(err); }
});

// DELETE /api/settings/assinatura — remove hotel signature
router.delete('/assinatura', async (req, res, next) => {
  try {
    const sigPath = path.join(DATA_DIR, 'uploads', 'signatures', 'hotel_sig.png');
    if (fs.existsSync(sigPath)) fs.unlinkSync(sigPath);
    const settings = await updateSettings({ assinatura_hotel_path: null, nome_hotel_assinante: null });
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
});

module.exports = router;
