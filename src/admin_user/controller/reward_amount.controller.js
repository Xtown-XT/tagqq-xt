import { ZodError } from 'zod';
import { rewardUpdateSchema } from '../../admin_user/dto/reward_amount.dto.js';
import {
  processUserRewards,
  updateRewardStatus,
  getAllRewards,
  deleteReward,
  restoreReward,
} from '../service/reward_amount.service.js';

// ✅ Centralized error handler
const handleError = (err, res) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
  }

  console.error('[Reward Controller Error]:', err);

  return res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

// ✅ Apply for reward
export const applyRewardController = async (req, res) => {
  try {
    const referral_id = req.user?.id || req.userAgent?.id || req.admin?.id;

    if (!referral_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User ID not found from token',
      });
    }

    const result = await processUserRewards(referral_id, referral_id);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

// ✅ Update reward status (PATCH /rewards/:rewardId)
export const updateRewardController = async (req, res) => {
  try {
    const paramValidation = rewardUpdateSchema.params.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: { params: paramValidation.error.flatten().fieldErrors },
      });
    }

    const bodyValidation = rewardUpdateSchema.body.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: { body: bodyValidation.error.flatten().fieldErrors },
      });
    }

    const { rewardId } = paramValidation.data;
    const { status, remarks,  } = bodyValidation.data;
    const updated_by = req.user?.id || req.userAgent?.id || req.admin?.id;
    const result = await updateRewardStatus({ rewardId, status, remarks, updated_by });

    return res.status(200).json({
      success: true,
      message: 'Reward updated successfully',
      data: result,
    });
  } catch (err) {
    handleError(err, res);
  }
};

// ✅ Get all rewards
export const getAllRewardsController = async (_, res) => {
  try {
    const result = await getAllRewards();
    return res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

// // ✅ Update full reward (PUT /rewards/:id)
// export const putRewardController = async (req, res) => {
//   try {
//     const result = await updateReward(req.params.id, req.body);
//     return res.status(200).json(result);
//   } catch (err) {
//     handleError(err, res);
//   }
// };

// ✅ Soft delete reward
export const softDeleteRewardController = async (req, res) => {
  try {
    const result = await deleteReward(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

// ✅ Restore soft-deleted reward
export const restoreRewardController = async (req, res) => {
  try {
    const result = await restoreReward(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};
