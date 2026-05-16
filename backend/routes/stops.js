const express = require('express');
const router = express.Router();
const Stop = require('../models/Stop');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const stops = await Stop.find().sort({ stopName: 1 });
  res.json(stops);
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const stop = await Stop.create(req.body);
    res.json(stop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const stop = await Stop.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(stop);
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await Stop.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
