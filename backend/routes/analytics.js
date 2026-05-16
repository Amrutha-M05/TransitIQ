const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const DelayReport = require('../models/DelayReport');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/summary', auth, adminOnly, async (req, res) => {
  const [totalFeedback, ratings, totalDelays, pendingFeedback] = await Promise.all([
    Feedback.countDocuments(),
    Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    DelayReport.countDocuments(),
    Feedback.countDocuments({ status: 'pending' })
  ]);
  res.json({
    totalFeedback,
    averageRating: ratings[0]?.avg?.toFixed(1) || 0,
    totalDelays,
    pendingFeedback
  });
});

router.get('/delay-trends', auth, adminOnly, async (req, res) => {
  const topDelayed = await DelayReport.aggregate([
    { $group: { _id: '$routeId', count: { $sum: 1 }, avgDelay: { $avg: '$delayMinutes' } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'routes', localField: '_id', foreignField: '_id', as: 'route' } },
    { $unwind: { path: '$route', preserveNullAndEmptyArrays: true } }
  ]);

  const ratingByCategory = await Feedback.aggregate([
    { $group: { _id: '$category', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    { $sort: { avgRating: 1 } }
  ]);

  const last7Days = await DelayReport.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ topDelayed, ratingByCategory, last7Days });
});

module.exports = router;
