const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, adminOnly, async (req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json(users);
});

router.patch('/:id/role', auth, adminOnly, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id, { role: req.body.role }, { new: true }
  ).select('-passwordHash');
  res.json(user);
});

module.exports = router;
