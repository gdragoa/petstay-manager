const express = require('express');
const router = express.Router();
const { getCollection, insertOne, deleteOne } = require('../utils/db');
const { requireFields } = require('../middleware/validate');

router.get('/blocked', (_req, res) => {
  const dates = getCollection('blocked_dates');
  res.json({ success: true, data: dates, total: dates.length });
});

router.post('/blocked', requireFields(['data']), async (req, res, next) => {
  try {
    const date = await insertOne('blocked_dates', {
      data: req.body.data,
      motivo: req.body.motivo || '',
    });
    res.status(201).json({ success: true, data: date });
  } catch (err) { next(err); }
});

router.delete('/blocked/:id', async (req, res, next) => {
  try {
    const deleted = await deleteOne('blocked_dates', req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Date not found', code: 'NOT_FOUND' });
    res.json({ success: true, data: { deleted: true } });
  } catch (err) { next(err); }
});

module.exports = router;
