const User = require('../../users/models/user.model');
const Battle = require('../../battles/models/battle.model');
const AuditLog = require('../models/auditLog.model');
const AdminConfig = require('../models/adminConfig.model');
const ApiResponse = require('../../../utils/apiResponse');

// Overview Stats
exports.getOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeBattles = await Battle.countDocuments({ status: 'active' });
    const totalBattles = await Battle.countDocuments();
    
    // Aggregation for volume and fees (assuming finance.entryTxPlayer1 means paid entry)
    const volumeData = await Battle.aggregate([
      { $match: { entryFee: { $exists: true } } },
      { $group: { _id: null, totalVolume: { $sum: { $multiply: ['$entryFee', 2] } } } }
    ]);
    const totalVolume = volumeData[0]?.totalVolume || 0;
    const feesEarned = totalVolume * 0.025; // Example 2.5%

    return ApiResponse.success(res, 'Overview retrieved', {
      totalUsers,
      activeBattles,
      totalBattles,
      totalVolume,
      feesEarned
    });
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

// Users Management
exports.getUsers = async (req, res) => {
  try {
    const { search, role, isBanned, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isBanned !== undefined) query.isBanned = isBanned === 'true';

    const users = await User.find(query)
      .select('-walletEncryptedSecret')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(query);

    return ApiResponse.success(res, 'Users retrieved', { users, total, page: Number(page) });
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBanned, role } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return ApiResponse.notFound(res, 'User not found');

    if (isBanned !== undefined) user.isBanned = isBanned;
    if (role) user.role = role;
    
    await user.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: isBanned ? 'BAN_USER' : (role ? 'SET_ROLE' : 'UNBAN_USER'),
      targetId: String(user._id),
      details: { isBanned, role },
      ipAddress: req.ip
    });

    return ApiResponse.success(res, 'User updated', { user });
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

// Config Management
exports.getConfig = async (req, res) => {
  try {
    const configs = await AdminConfig.find();
    return ApiResponse.success(res, 'Config retrieved', { configs });
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { key, value } = req.body;
    const config = await AdminConfig.findOneAndUpdate(
      { key },
      { value, updatedBy: req.user._id, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      adminId: req.user._id,
      action: 'UPDATE_CONFIG',
      targetId: key,
      details: { newValue: value },
      ipAddress: req.ip
    });

    return ApiResponse.success(res, 'Config updated', { config });
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

// Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await AuditLog.find()
      .populate('adminId', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await AuditLog.countDocuments();
    return ApiResponse.success(res, 'Logs retrieved', { logs, total });
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

// Battles Management
exports.cancelBattle = async (req, res) => {
  try {
    const { matchId } = req.params;
    const battleService = require('../../battles/services/battle.service');
    const battle = await battleService.getBattleByMatchId(matchId);
    
    if (!battle) return ApiResponse.notFound(res, 'Battle not found');

    if (battle.status !== 'open') {
        return ApiResponse.error(res, 'Only open battles can be cancelled via admin directly');
    }
    
    battle.status = 'cancelled';
    battle.endedAt = new Date();
    await battle.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: 'CANCEL_BATTLE',
      targetId: matchId,
      details: {},
      ipAddress: req.ip
    });

    return ApiResponse.success(res, 'Battle cancelled', { battle });
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

exports.finalizeBattle = async (req, res) => {
  try {
    const { matchId } = req.params;
    const battleService = require('../../battles/services/battle.service');
    await battleService.finalizeBattle({ matchId, actorUserId: req.user._id, internalCall: true });
    
    await AuditLog.create({
      adminId: req.user._id,
      action: 'FINALIZE_BATTLE',
      targetId: matchId,
      details: {},
      ipAddress: req.ip
    });

    return ApiResponse.success(res, 'Battle finalized');
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

exports.refundBattle = async (req, res) => {
  try {
    const { matchId } = req.params;
    const battleService = require('../../battles/services/battle.service');
    const BattleModel = require('../../battles/models/battle.model');
    const battle = await BattleModel.findOne({ matchId });
    if (!battle) return ApiResponse.notFound(res, 'Battle not found');
    
    const hashes = await battleService.refundBattleEscrowOnCancel(battle);
    
    await AuditLog.create({
      adminId: req.user._id,
      action: 'REFUND_BATTLE',
      targetId: matchId,
      details: { hashes },
      ipAddress: req.ip
    });

    return ApiResponse.success(res, 'Battle refunded', { hashes });
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

// Treasury
exports.getTreasury = async (req, res) => {
  try {
    const chainService = require('../../battles/services/battleChain.service');
    const escrowPublic = chainService.getEscrowPublic();
    
    return ApiResponse.success(res, 'Treasury retrieved', {
       contractId: process.env.STELLAR_CONTRACT_ID,
       escrowPublic,
       network: process.env.STELLAR_NETWORK
    });
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

// Moderation
exports.getReports = async (req, res) => {
  try {
    const Report = require('../models/report.model');
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    
    const reports = await Report.find(query)
      .populate('reporterId', 'username email')
      .populate('resolvedBy', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Report.countDocuments(query);
    
    return ApiResponse.success(res, 'Reports retrieved', { reports, total, page: Number(page) });
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const Report = require('../models/report.model');
    const { reportId } = req.params;
    const { status } = req.body;
    
    const report = await Report.findById(reportId);
    if (!report) return ApiResponse.notFound(res, 'Report not found');
    
    report.status = status;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    await report.save();
    
    await AuditLog.create({
      adminId: req.user._id,
      action: 'RESOLVE_REPORT',
      targetId: reportId,
      details: { status },
      ipAddress: req.ip
    });

    return ApiResponse.success(res, 'Report resolved', { report });
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};