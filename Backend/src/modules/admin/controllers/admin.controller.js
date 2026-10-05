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