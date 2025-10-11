import express from 'express';
import Adminuser from './admin_user.routes.js';
import PointRouter from './points.routes.js';
import rewardRouter from './reward_amount.routes.js';
import posterRouter from './poster.routes.js';

const router = express.Router();
router.use('/admin',Adminuser);
router.use('/admin',PointRouter);
router.use('/admin', rewardRouter);
router.use('/admin', posterRouter);

export default router;