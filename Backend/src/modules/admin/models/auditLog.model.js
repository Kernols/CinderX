const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['BAN_USER', 'UNBAN_USER', 'SET_ROLE', 'CANCEL_BATTLE', 'FINALIZE_BATTLE', 'REFUND_BATTLE', 'UPDATE_CONFIG', 'MODERATE_ROAST'],
  },
  targetId: {
    type: String,
    required: true, // ID of the user, battle, or config key affected
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
