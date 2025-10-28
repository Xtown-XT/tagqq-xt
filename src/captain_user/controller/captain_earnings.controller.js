// controllers/captain_earnings.controller.js
import { getCaptainTodayEarningsService } from '../service/captain_earnings.sevice.js';

export const getCaptainTodayEarningsController = async (req, res) => {
  try {
    const captainId = req.captain?.id || req.query.captain_id;
    if (!captainId) {
      return res.sendError('Captain ID is required', 400);
    }

    const result = await getCaptainTodayEarningsService(captainId);
    return res.sendSuccess({ data: result }, 'Captain earnings retrieved successfully');
  } catch (error) {
    console.error('Error in getCaptainTodayEarningsController:', error);
    return res.sendError(error.message, 500);
  }
};
