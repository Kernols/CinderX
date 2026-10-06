
const mongoose = require('mongoose');
const tournSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['UPCOMING', 'ONGOING', 'COMPLETED'], default: 'UPCOMING' },
  prizePoolUSDC: { type: Number, default: 0 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxParticipants: { type: Number, default: 16 },
  brackets: { type: mongoose.Schema.Types.Mixed, default: {} },
  startDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Tournament', tournSchema);
