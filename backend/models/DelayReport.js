const mongoose = require('mongoose');
const delaySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  stopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true },
  expectedTime: { type: String },
  actualTime: { type: String },
  delayMinutes: { type: Number },
  crowdLevel: { type: String, enum: ['low', 'medium', 'high', 'very_high'], default: 'medium' },
  upvotesCount: { type: Number, default: 0 },
  upvoters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['new', 'verified', 'resolved'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('DelayReport', delaySchema);
