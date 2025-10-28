


// routes/captain_earnings.routes.js
import express from 'express';
import { getCaptainTodayEarningsController } from '../controller/captain_earnings.controller.js';
import { authenticate } from '../../middleware/index.js';

const router = express.Router();

router.get(
  '/captain_earnings/today',
  authenticate(['captain', 'admin']),
  getCaptainTodayEarningsController
);

export default router;