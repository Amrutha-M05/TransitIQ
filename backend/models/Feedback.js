const mongoose = require('mongoose');
const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  stopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop' },
  category: { type: String, enum: ['cleanliness', 'punctuality', 'safety', 'staff', 'overcrowding', 'other'], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  imageUrl: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'hidden'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Feedback', feedbackSchema);
