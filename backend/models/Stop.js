const mongoose = require('mongoose');
const stopSchema = new mongoose.Schema({
  stopName: { type: String, required: true },
  location: { type: String },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Stop', stopSchema);
