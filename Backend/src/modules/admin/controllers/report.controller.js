const Report = require('../models/report.model');
const ApiResponse = require('../../../utils/apiResponse');

exports.submitReport = async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    
    if (!['ROAST', 'CHAT', 'USER'].includes(targetType)) {
      return ApiResponse.error(res, 'Invalid target type');
    }

    if (!targetId || !reason) {
      return ApiResponse.error(res, 'Missing required fields');
    }

    const report = await Report.create({
      reporterId: req.user._id,
      targetType,
      targetId,
      reason
    });

    return ApiResponse.success(res, 'Report submitted successfully', { report });
  } catch (error) {
    return ApiResponse.error(res, error.message);
  }
};
