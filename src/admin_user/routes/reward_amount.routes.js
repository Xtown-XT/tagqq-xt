import express from 'express';
import {
  applyRewardController,
  updateRewardController,
  getAllRewardsController,
  // putRewardController,
  softDeleteRewardController,
  restoreRewardController,
} from '../controller/reward_amount.controller.js';
import { validate,  authenticate } from '../../middleware/index.js';

const router = express.Router();

router.post('/rewards/apply',authenticate(['end_user', 'admin', 'user_agent']), applyRewardController);
router.put('/rewards/:rewardId', authenticate(['admin']), updateRewardController);
router.get('/rewards/all', authenticate(['admin']), getAllRewardsController);
// router.put('/rewards/:id',authenticate(['admin']), putRewardController);
router.delete('/rewards/:id', authenticate(['admin']), softDeleteRewardController);
router.patch('/rewards/:id', authenticate(['admin']),  restoreRewardController);

export default router;
