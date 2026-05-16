const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Feedback = require('../models/Feedback');
const { auth, adminOnly } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { routeId, busId, stopId, category, rating, comment } = req.body;
    const feedback = await Feedback.create({
      userId: req.user.id,
      routeId: routeId || undefined,
      busId: busId || undefined,
      stopId: stopId || undefined,
      category, rating: Number(rating), comment,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined
    });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', auth, async (req, res) => {
  const feedback = await Feedback.find({ userId: req.user.id })
    .populate('routeId', 'routeCode routeName')
    .populate('stopId', 'stopName')
    .populate('busId', 'busNumber')
    .sort({ createdAt: -1 });
  res.json(feedback);
});

router.get('/', auth, adminOnly, async (req, res) => {
  const feedback = await Feedback.find()
    .populate('userId', 'name email')
    .populate('routeId', 'routeCode routeName')
    .populate('stopId', 'stopName')
    .populate('busId', 'busNumber')
    .sort({ createdAt: -1 });
  res.json(feedback);
});

router.patch('/:id/status', auth, adminOnly, async (req, res) => {
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(feedback);
});

module.exports = router;
