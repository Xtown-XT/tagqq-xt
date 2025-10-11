// import { sendOtpToUser, sendGreetingToUser } from '../service/smtp.service.js';
// import { decrypt } from '../utils/encrypt.js';

// export const sendOtpController = async (req, res) => {
//   const { email } = req.body;
//   if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

//   try {
//     const { encryptedOtp } = await sendOtpToUser(email);
//     const otp = decrypt(encryptedOtp);

//     return res.sendSuccess({
//       encryptedOtp,
//     }, "OTP Sent SucessFully");
//   } catch (err) {
//     console.error('OTP Send Error:', err);
//     return res.sendError(err.message, 500);
//   }
// };

// export const sendGreetingController = async (req, res) => {
//   const { email } = req.body;
//   if (!email) return res.sendError('Email is required', 400);

//   try {
//     const result = await sendGreetingToUser(email);
//     return res.sendSuccess({ data: { ...result } }, "Greeting Sent Sucessfully");
//   } catch (err) {
//     console.error('Greeting Email Error:', err);
//     return res.sendError(err.message, 500);
//   }
// };



import {
  sendOtpToUser,
  sendGreetingToUser,
  sendOrderConfirmedAlert,
  sendPaymentSuccessAlert,
  sendPaymentFailedAlert,
  sendCustomAlert
} from '../service/smtp.service.js';

import { decrypt } from '../utils/encrypt.js';

// Send OTP
export const sendOtpController = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.sendError('Email is required', 400);

  try {
    const { encryptedOtp } = await sendOtpToUser(email);
    const otp = decrypt(encryptedOtp); // Optional: remove if you don’t want to return plain OTP

    return res.sendSuccess({ encryptedOtp }, 'OTP Sent Successfully');
  } catch (err) {
    console.error('OTP Send Error:', err);
    return res.sendError(err.message, 500);
  }
};

// Send Greeting
export const sendGreetingController = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.sendError('Email is required', 400);

  try {
    const result = await sendGreetingToUser(email);
    return res.sendSuccess({ data: result }, 'Greeting Sent Successfully');
  } catch (err) {
    console.error('Greeting Email Error:', err);
    return res.sendError(err.message, 500);
  }
};

// Order Confirmed
export const sendOrderAlertController = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.sendError('Email is required', 400);

  try {
    const result = await sendOrderConfirmedAlert(email);
    return res.sendSuccess({ data: result }, 'Order Confirmation Email Sent');
  } catch (err) {
    console.error('Order Alert Error:', err);
    return res.sendError(err.message, 500);
  }
};

// Payment Successful
export const sendPaymentSuccessController = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.sendError('Email is required', 400);

  try {
    const result = await sendPaymentSuccessAlert(email);
    return res.sendSuccess({ data: result }, 'Payment Success Email Sent');
  } catch (err) {
    console.error('Payment Success Alert Error:', err);
    return res.sendError(err.message, 500);
  }
};

// Payment Failed
export const sendPaymentFailedController = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.sendError('Email is required', 400);

  try {
    const result = await sendPaymentFailedAlert(email);
    return res.sendSuccess({ data: result }, 'Payment Failure Email Sent');
  } catch (err) {
    console.error('Payment Failure Alert Error:', err);
    return res.sendError(err.message, 500);
  }
};

// Custom Alert
export const sendCustomAlertController = async (req, res) => {
  const { email, title, message } = req.body;
  if (!email || !title || !message)
    return res.sendError('Email, title, and message are required', 400);

  try {
    const result = await sendCustomAlert(email, title, message);
    return res.sendSuccess({ data: result }, 'Custom Alert Email Sent');
  } catch (err) {
    console.error('Custom Alert Error:', err);
    return res.sendError(err.message, 500);
  }
};
