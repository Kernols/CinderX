
const Notification = require('../models/notification.model');
const ApiResponse = require('../../../utils/apiResponse');

exports.getNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    return ApiResponse.success(res, 'Notifications fetched', { notifications: notifs });
  } catch (error) { return ApiResponse.error(res, error.message); }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    return ApiResponse.success(res, 'Marked as read');
  } catch (error) { return ApiResponse.error(res, error.message); }
};
