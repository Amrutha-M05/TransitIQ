const mongoose = require('mongoose');
const routeSchema = new mongoose.Schema({
  routeCode: { type: String, required: true, unique: true },
  routeName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Route', routeSchema);
