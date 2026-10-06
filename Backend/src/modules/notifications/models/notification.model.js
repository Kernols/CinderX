
const mongoose = require('mongoose');
const notifSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['BATTLE_INVITE', 'VOTE_RECEIVED', 'FOLLOW', 'TOURNAMENT'], required: true },
  message: { type: String, required: true },
  link: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Notification', notifSchema);
