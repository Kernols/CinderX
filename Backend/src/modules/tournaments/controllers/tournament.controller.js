
const Tournament = require('../models/tournament.model');
const ApiResponse = require('../../../utils/apiResponse');

exports.listTournaments = async (req, res) => {
  try {
    const tourns = await Tournament.find().sort({ startDate: 1 });
    return ApiResponse.success(res, 'Tournaments fetched', { tournaments: tourns });
  } catch (error) { return ApiResponse.error(res, error.message); }
};

exports.joinTournament = async (req, res) => {
  try {
    const tourn = await Tournament.findById(req.params.id);
    if (!tourn) return ApiResponse.notFound(res, 'Tournament not found');
    if (tourn.participants.length >= tourn.maxParticipants) return ApiResponse.error(res, 'Tournament full');
    if (!tourn.participants.includes(req.user._id)) {
      tourn.participants.push(req.user._id);
      await tourn.save();
    }
    return ApiResponse.success(res, 'Joined successfully', { tournament: tourn });
  } catch (error) { return ApiResponse.error(res, error.message); }
};
