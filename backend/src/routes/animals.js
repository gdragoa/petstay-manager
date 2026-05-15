const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const { getCollection, findById, insertOne, updateOne, deleteOne, findWhere, DATA_DIR, assertInsideDataDir } = require('../utils/db');
const { requireFields } = require('../middleware/validate');
const { vaccinaUploader } = require('../middleware/upload');

function sanitizeFilename(fname) {
  // Reject any path separators or traversal sequences
  if (!fname || /[/\\]/.test(fname) || fname.includes('..')) {
    throw Object.assign(new Error('Invalid filename'), { status: 400, code: 'INVALID_FILE' });
  }
  return fname;
}

router.get('/', (req, res) => {
  let animals = getCollection('animals');
  if (req.query.tutor_id) animals = animals.filter(a => a.tutor_id === req.query.tutor_id);
  res.json({ success: true, data: animals, total: animals.length });
});

router.get('/:id', (req, res) => {
  const animal = findById('animals', req.params.id);
  if (!animal) return res.status(404).json({ success: false, error: 'Animal not found', code: 'NOT_FOUND' });
  const bookings = findWhere('bookings', { animal_id: animal.id });
  res.json({ success: true, data: { ...animal, bookings } });
});

router.post('/', requireFields(['tutor_id', 'nome', 'especie']), async (req, res, next) => {
  try {
    const animal = await insertOne('animals', {
      tutor_id: req.body.tutor_id,
      nome: req.body.nome,
      especie: req.body.especie,
      raca: req.body.raca || '',
      idade: req.body.idade || 0,
      peso: req.body.peso || 0,
      saude: req.body.saude || { vacinas: [], alergias: [], observacoes: '' },
      preferencias: req.body.preferencias || { alimentacao: '', comportamento: '' },
      arquivos_vacinacao: [],
    });
    res.status(201).json({ success: true, data: animal });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const animal = await updateOne('animals', req.params.id, req.body);
    if (!animal) return res.status(404).json({ success: false, error: 'Animal not found', code: 'NOT_FOUND' });
    res.json({ success: true, data: animal });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    // Referential integrity — block delete if active bookings exist
    const activeBookings = findWhere('bookings', { animal_id: req.params.id })
      .filter(b => !['cancelado', 'check-out'].includes(b.status_presenca));
    if (activeBookings.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Animal has active bookings',
        code: 'HAS_ACTIVE_BOOKINGS',
      });
    }
    const deleted = await deleteOne('animals', req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Animal not found', code: 'NOT_FOUND' });
    res.json({ success: true, data: { deleted: true } });
  } catch (err) { next(err); }
});

router.post('/:id/vacina', (req, res, next) => {
  const animalDir = path.join(DATA_DIR, 'uploads', `animal_${req.params.id}`);
  if (!fs.existsSync(animalDir)) fs.mkdirSync(animalDir, { recursive: true });

  const uploader = vaccinaUploader.single('file');
  uploader(req, res, async err => {
    if (err) return next(err);
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded', code: 'NO_FILE' });

    const destPath = path.join(animalDir, req.file.filename);
    // Validate destination stays inside data dir
    try { assertInsideDataDir(destPath); } catch (e) { return next(e); }

    fs.renameSync(req.file.path, destPath);

    const relativePath = `uploads/animal_${req.params.id}/${req.file.filename}`;
    const animal = findById('animals', req.params.id);
    if (!animal) return res.status(404).json({ success: false, error: 'Animal not found', code: 'NOT_FOUND' });

    const updated = await updateOne('animals', req.params.id, {
      arquivos_vacinacao: [...(animal.arquivos_vacinacao || []), relativePath],
    });
    res.json({ success: true, data: updated });
  });
});

router.delete('/:id/vacina/:fname', async (req, res, next) => {
  try {
    sanitizeFilename(req.params.fname); // throws on traversal

    const animal = findById('animals', req.params.id);
    if (!animal) return res.status(404).json({ success: false, error: 'Animal not found', code: 'NOT_FOUND' });

    const filePath = path.join(DATA_DIR, 'uploads', `animal_${req.params.id}`, req.params.fname);
    assertInsideDataDir(filePath); // double-check resolved path

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const relativePath = `uploads/animal_${req.params.id}/${req.params.fname}`;
    const updated = await updateOne('animals', req.params.id, {
      arquivos_vacinacao: (animal.arquivos_vacinacao || []).filter(p => p !== relativePath),
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

module.exports = router;
