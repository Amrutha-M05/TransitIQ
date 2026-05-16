const express = require('express');
const router = express.Router();
const DelayReport = require('../models/DelayReport');
const { auth, adminOnly } = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { routeId, stopId, expectedTime, actualTime, delayMinutes, crowdLevel } = req.body;
    const report = await DelayReport.create({
      userId: req.user.id, routeId, stopId,
      expectedTime, actualTime, delayMinutes: delayMinutes ? Number(delayMinutes) : undefined,
      crowdLevel
    });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', auth, async (req, res) => {
  const reports = await DelayReport.find({ userId: req.user.id })
    .populate('routeId', 'routeCode routeName')
    .populate('stopId', 'stopName')
    .sort({ createdAt: -1 });
  res.json(reports);
});

router.get('/public', async (req, res) => {
  const { route, stop } = req.query;
  const filter = { status: { $in: ['new', 'verified'] } };
  
  let reports = await DelayReport.find(filter)
    .populate('routeId', 'routeCode routeName')
    .populate('stopId', 'stopName')
    .populate('userId', 'name')
    .sort({ createdAt: -1 })
    .limit(50);

  if (route) {
    reports = reports.filter(r => 
      r.routeId?.routeCode?.toLowerCase().includes(route.toLowerCase()) ||
      r.routeId?.routeName?.toLowerCase().includes(route.toLowerCase())
    );
  }
  if (stop) {
    reports = reports.filter(r => 
      r.stopId?.stopName?.toLowerCase().includes(stop.toLowerCase())
    );
  }
  res.json(reports);
});

router.get('/', auth, adminOnly, async (req, res) => {
  const reports = await DelayReport.find()
    .populate('userId', 'name email')
    .populate('routeId', 'routeCode routeName')
    .populate('stopId', 'stopName')
    .sort({ createdAt: -1 });
  res.json(reports);
});

router.post('/:id/upvote', auth, async (req, res) => {
  const report = await DelayReport.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  const alreadyVoted = report.upvoters.includes(req.user.id);
  if (alreadyVoted) {
    report.upvoters.pull(req.user.id);
    report.upvotesCount = Math.max(0, report.upvotesCount - 1);
  } else {
    report.upvoters.push(req.user.id);
    report.upvotesCount += 1;
  }
  await report.save();
  res.json({ upvotesCount: report.upvotesCount, upvoted: !alreadyVoted });
});

router.patch('/:id/status', auth, adminOnly, async (req, res) => {
  const report = await DelayReport.findByIdAndUpdate(
    req.params.id, { status: req.body.status }, { new: true }
  );
  res.json(report);
});

module.exports = router;
