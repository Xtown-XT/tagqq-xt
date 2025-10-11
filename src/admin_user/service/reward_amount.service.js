import { Op } from 'sequelize';
import RewardAmount from '../models/reward_amount.models.js';
import Points from '../../admin_user/models/points.models.js';
import Enduser from '../../endUser/models/user.model.js';
import Useragent from '../../user_agent/models/user_agent.model.js';
import Adminuser from '../../admin_user/models/admin_user.models.js';


// // 1. Apply for reward
// export const processUserRewards = async (referralId, createdBy) => {
//   const transaction = await RewardAmount.sequelize.transaction();
//   try {
//     // ✅ Step 1: Check user existence
//     const user =
//       (await Enduser.findByPk(referralId, { transaction })) ||
//       (await Useragent.findByPk(referralId, { transaction })) ||
//       (await Adminuser.findByPk(referralId, { transaction }));

//     if (!user) {
//       await transaction.rollback();
//       return { success: false, message: 'User not found' };
//     }

//     // ✅ Step 2: Prevent duplicate applications
//     const existing = await RewardAmount.findOne({
//       where: {
//         referral_id: referralId,
//         status: { [Op.in]: ['Applied', 'Approved'] },
//       },
//       transaction,
//     });

//     if (existing) {
//       await transaction.rollback();
//       return {
//         success: false,
//         message: 'You already have a pending or approved reward',
//       };
//     }

//     // ✅ Step 3: Fetch eligible points
//     const eligiblePoints = await Points.findAll({
//       where: {
//         referral_id: referralId,
//         remarks: 'Success',
//         is_active: true,
//       },
//       order: [['createdAt', 'ASC']], // 🔧 FIXED field name
//       transaction,
//     });

//     const totalPoints = eligiblePoints.reduce((sum, p) => sum + p.points, 0);

//     if (totalPoints < 200) {
//       await transaction.rollback();
//       return {
//         success: false,
//         message: 'At least 200 points required to redeem',
//       };
//     }

//     // ✅ Step 4: Deduct 200 points & update remarks
//     let remaining = 200;
//     for (const point of eligiblePoints) {
//       if (remaining <= 0) break;
//       const deduct = Math.min(point.points, remaining);
//       point.points -= deduct;
//       point.remarks = 'Redeemed';
//       point.updated_by = createdBy;
//       await point.save({ transaction });
//       remaining -= deduct;
//     }

//     // ✅ Step 5: Create reward
//     const reward = await RewardAmount.create({
//       referral_id: referralId,
//       amount: 100,
//       points_redeemed: 200,
//       status: 'Applied',
//       remarks: 'Redemption requested',
//       created_by: createdBy,
//     }, { transaction });

//     await transaction.commit();

//     return {
//       success: true,
//       message: 'Reward request submitted',
//       data: reward,
//     };
//   } catch (err) {
//     await transaction.rollback();
//     throw err;
//   }
// };

// export const processUserRewards = async (referralId, createdBy) => {
//   const transaction = await RewardAmount.sequelize.transaction();
//   try {
//     // Step 1: Verify user
//     const user =
//       (await Enduser.findByPk(referralId, { transaction })) ||
//       (await Useragent.findByPk(referralId, { transaction })) ||
//       (await Adminuser.findByPk(referralId, { transaction }));

//     if (!user) {
//       await transaction.rollback();
//       return { success: false, message: 'User not found' };
//     }

//     // Step 2: Check for duplicate requests
//     const existing = await RewardAmount.findOne({
//       where: {
//         referral_id: referralId,
//         status: { [Op.in]: ['Applied', 'Approved'] },
//       },
//       transaction,
//     });

//     if (existing) {
//       await transaction.rollback();
//       return {
//         success: false,
//         message: 'You already have a pending or approved reward',
//       };
//     }

//     // Step 3: Collect eligible points
//     const eligiblePoints = await Points.findAll({
//       where: {
//         referral_id: referralId,
//         is_active: true,
//       },
//       order: [['createdAt', 'ASC']],
//       transaction,
//     });

//     const totalPoints = eligiblePoints.reduce((sum, p) => sum + p.points, 0);

//     if (totalPoints < 200) {
//       await transaction.rollback();
//       return {
//         success: false,
//         message: 'At least 200 points required to redeem',
//       };
//     }

//     // Step 4: Deduct 200 points
//     let remaining = 200;
//     for (const point of eligiblePoints) {
//       if (remaining <= 0) break;
//       const deduct = Math.min(point.points, remaining);
//       point.points -= deduct;
//       point.remarks = 'success';
//       point.updated_by = createdBy;
//       await point.save({ transaction });
//       remaining -= deduct;
//     }

//     // Step 5: Create reward entry
//     const reward = await RewardAmount.create({
//       referral_id: referralId,
//       amount: 100,
//       points_redeemed: 200,
//       status: 'Applied',
//       remarks: 'Redemption requested',
//       created_by: createdBy,
//     }, { transaction });

//     await transaction.commit();
//     return {
//       success: true,
//       message: 'Reward request submitted',
//       data: reward,
//     };
//   } catch (err) {
//     await transaction.rollback();
//     throw err;
//   }
// };


export const processUserRewards = async (referralId, createdBy) => {
  const transaction = await RewardAmount.sequelize.transaction();

  try {
    // Step 1: Verify user exists
    const user =
      (await Enduser.findByPk(referralId, { transaction })) ||
      (await Useragent.findByPk(referralId, { transaction })) ||
      (await Adminuser.findByPk(referralId, { transaction }));

    if (!user) {
      await transaction.rollback();
      return { success: false, message: 'User not found' };
    }

    // Step 2: Check for existing pending/approved reward
    const existing = await RewardAmount.findOne({
      where: {
        referral_id: referralId,
        status: { [Op.in]: ['Applied', 'Approved'] },
      },
      transaction,
    });

    if (existing) {
      await transaction.rollback();
      return {
        success: false,
        message: 'You already have a pending or approved reward',
      };
    }

    // Step 3: Fetch eligible points
    const eligiblePoints = await Points.findAll({
      where: {
        referral_id: referralId,
        is_active: true,
      },
      order: [['createdAt', 'ASC']],
      transaction,
    });

    const totalPoints = eligiblePoints.reduce((sum, p) => sum + p.points, 0);

    if (totalPoints < 200) {
      await transaction.rollback();
      return {
        success: false,
        message: 'At least 200 points required to redeem',
      };
    }

    // Step 4: Deduct 200 points
let remaining = 200;
for (const point of eligiblePoints) {
  if (remaining <= 0) break;

  const usable = Math.min(point.points, remaining);
  point.remarks = 'success';
  point.updated_by = createdBy;

  await point.save({ transaction });

  remaining -= usable;
}

    // Step 5: Create reward entry
    const reward = await RewardAmount.create({
      referral_id: referralId,
      amount: 100,
      points_redeemed: 200,
      status: 'Applied',
      remarks: 'Redemption requested',
      created_by: createdBy,
    }, { transaction });

    await transaction.commit();

    return {
      success: true,
      message: 'Reward request submitted',
      data: reward,
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};


export const updateRewardStatus = async ({rewardId, status, remarks, updated_by} ) => {
  const reward = await RewardAmount.findByPk(rewardId);
  if (!reward) throw new Error('Reward not found');
  if (reward.status === 'Success') throw new Error('Reward already marked as Success');

  reward.status     = status;
  reward.updated_by = updated_by;
  reward.remarks    = remarks ?? (status === 'Success' ? 'Payment success' : status);

  if (status === 'Success') {
    reward.payment_sent_at = new Date();

    // Deduct the redeemed points FIFO
    let remaining = reward.points_redeemed;
    const successfulPoints = await Points.findAll({
      where: {
        referral_id: reward.referral_id,
        remarks: 'Success',
        points: { [Op.gt]: 0 },
      },
      order: [['createdAt', 'ASC']],
    });

    for (const pt of successfulPoints) {
      if (remaining <= 0) break;
      const deduct = Math.min(pt.points, remaining);
      pt.points      -= deduct;
      pt.updated_by   = updated_by;
      await pt.save();
      remaining      -= deduct;
    }
  }

  await reward.save();
  return { success: true, message: `Reward status updated to ${status}`, payment_sent_at: reward.payment_sent_at };
};












export const getAllRewards = async () => {
  const rewards = await RewardAmount.findAll({ order: [['createdAt', 'DESC']] });
  return { success: true, data: rewards };
};

// export const updateReward = async (rewardId, data) => {
//   const reward = await RewardAmount.findByPk(rewardId);
//   if (!reward) throw new Error('Reward not found');
//   delete data.status;  // status handled only via updateRewardStatus
//   await reward.update(data);
//   return { success: true, message: 'Reward updated', data: reward };
// };



export const deleteReward = async (rewardId) => {
  const reward = await RewardAmount.findByPk(rewardId);
  if (!reward) throw new Error('Reward not found');
  await reward.destroy();  // soft delete
  return { success: true, message: 'Reward soft‐deleted' };
};

export const restoreReward = async (rewardId) => {
  const reward = await RewardAmount.findOne({
    where: { id: rewardId },
    paranoid: false,
  });
  if (!reward) throw new Error('Reward not found');
  if (!reward.deleted_at) throw new Error('Reward is not deleted');
  await reward.restore();
  return { success: true, message: 'Reward restored' };
};
