const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const routes = await Route.find().sort({ routeCode: 1 });
  res.json(routes);
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.json(route);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(route);
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await Route.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
