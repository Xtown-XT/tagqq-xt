import express from 'express';
import  Captainuser  from "./captain_user.routes.js";

import Captainconfig from './captain_config.routes.js';
import captainProfile from './captain_profile.routes.js';
import captain_attendance from "./captain_checkins.routes.js";
import CaptainTransaction from './captainTransactionRoutes.js';
import CaptainWithdrawTransaction from './captain_withdraw.routes.js';
import CaptainEnhancement from './captain_suggestion.routes.js';



const router = express.Router();

router.use('/captain', Captainuser);
router.use('/captain', captainProfile);
router.use('/captain', Captainconfig);
router.use('/captain', captain_attendance);
router.use('/captain', CaptainTransaction);
router.use('/captain', CaptainWithdrawTransaction);
router.use('/captain', CaptainEnhancement);


export default router;