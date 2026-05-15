const express = require('express');
const router = express.Router();
const { getCollection, findById, insertOne, updateOne, deleteOne, findWhere } = require('../utils/db');
const { requireFields } = require('../middleware/validate');

router.get('/', (req, res) => {
  let tutors = getCollection('tutors');
  if (req.query.q) {
    const q = req.query.q.toLowerCase();
    tutors = tutors.filter(t => t.nome?.toLowerCase().includes(q) || t.telefone?.includes(q));
  }
  res.json({ success: true, data: tutors, total: tutors.length });
});

router.get('/:id', (req, res) => {
  const tutor = findById('tutors', req.params.id);
  if (!tutor) return res.status(404).json({ success: false, error: 'Tutor not found', code: 'NOT_FOUND' });
  const animals = findWhere('animals', { tutor_id: tutor.id });
  res.json({ success: true, data: { ...tutor, animals } });
});

router.post('/', requireFields(['nome', 'telefone']), async (req, res, next) => {
  try {
    const tutor = await insertOne('tutors', {
      nome: req.body.nome,
      telefone: req.body.telefone,
      email: req.body.email || '',
      endereco: req.body.endereco || '',
      tipo: req.body.tipo || 'primario',
    });
    res.status(201).json({ success: true, data: tutor });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const tutor = await updateOne('tutors', req.params.id, req.body);
    if (!tutor) return res.status(404).json({ success: false, error: 'Tutor not found', code: 'NOT_FOUND' });
    res.json({ success: true, data: tutor });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const activeBookings = findWhere('bookings', { tutor_id: req.params.id })
      .filter(b => !['cancelado', 'check-out'].includes(b.status_presenca));
    if (activeBookings.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Tutor has active bookings',
        code: 'HAS_ACTIVE_BOOKINGS',
      });
    }
    const deleted = await deleteOne('tutors', req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Tutor not found', code: 'NOT_FOUND' });
    res.json({ success: true, data: { deleted: true } });
  } catch (err) { next(err); }
});

module.exports = router;
