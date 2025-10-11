// import express from 'express';
// import { sendOtpController, sendGreetingController } from '../controller/smtp.controller.js';
// import { authenticate } from '../../middleware/index.js';

// const router = express.Router();

// // Require authenticated user for both routes
// router.post('/smtp/send-otp',authenticate(['end_user', 'admin', 'user_agent']), sendOtpController);
// router.post('/smtp/send-greeting', authenticate(['admin']), sendGreetingController);

// export default router;



import express from 'express';
import {
  sendOtpController,
  sendGreetingController,
  sendOrderAlertController,
  sendPaymentSuccessController,
  sendPaymentFailedController,
  sendCustomAlertController
} from '../controller/smtp.controller.js';

import { authenticate } from '../../middleware/index.js';

const router = express.Router();

// Send OTP - accessible by end_user, admin, user_agent
router.post('/smtp/send-otp', 
    // authenticate(['end_user', 'admin', 'user_agent']), 
    sendOtpController);

// Send Greeting - only by admin
router.post('/smtp/send-greeting', 
    // authenticate(['admin']), 
    sendGreetingController);

// Order Confirmed Alert - only by admin
router.post('/smtp/alert/order-confirmed', 
    // authenticate(['admin']), 
    sendOrderAlertController);

// Payment Success Alert - only by admin
router.post('/smtp/alert/payment-success', 
    // authenticate(['admin']),
     sendPaymentSuccessController);

// Payment Failed Alert - only by admin
router.post('/smtp/alert/payment-failed', 
    // authenticate(['admin']), 
sendPaymentFailedController);

// Custom Alert - only by admin
router.post('/smtp/alert/custom', 
    // authenticate(['admin']), 
    sendCustomAlertController);

export default router;

