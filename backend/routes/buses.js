const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const buses = await Bus.find().populate('routeId', 'routeCode routeName').sort({ busNumber: 1 });
  res.json(buses);
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.json(bus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('routeId', 'routeCode routeName');
  res.json(bus);
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await Bus.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
