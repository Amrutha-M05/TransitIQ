const mongoose = require('mongoose');
const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Bus', busSchema);
