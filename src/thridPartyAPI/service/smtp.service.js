// import nodemailer from 'nodemailer';
// import User from '../../endUser/models/user.model.js';
// import Otp from '../models/smtp.models.js';
// import { encrypt } from '../utils/encrypt.js';
// import dotenv from 'dotenv';

// dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT),
//   secure: Number(process.env.SMTP_PORT) === 465,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// export const sendOtpToUser = async (email) => {
//   const user = await User.findOne({ where: { email } });
//   if (!user) throw new Error(`User with email ${email} not found`);
//   if (user.is_verified) throw new Error(`User is already verified`);

//   const otp = generateOTP();
//   const encryptedOtp = encrypt(otp);

//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM,
//     to: email,
//     subject: 'Your OTP for Tagqq Verification',
//     html: `
//       <div style="font-family: Arial, sans-serif;">
//         <h2> OTP Verification</h2>
//         <p>Hello <strong>${user.username || 'User'}</strong>,</p>
//         <p>Your One-Time Password (OTP) is:</p>
//         <h1 style="color: #2e7d32;">${otp}</h1>
//         <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
//         <p>– The Tagqq Team</p>
//       </div>
//     `
//   });

//   // 10 minutes
//   await Otp.create({
//     email,
//     otp: encryptedOtp,
//     expires_at: new Date(Date.now() + 10 * 60 * 1000),
//   });

//   return { encryptedOtp };
// };

// export const sendGreetingToUser = async (email) => {
//   // const user = await User.findOne({ where: { email } });
//   // if (!user) throw new Error(`User with email ${email} not found`);
//   // if (!user.is_verified) throw new Error(`User is not verified`);

//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM,
//     to: email,
//     subject: ' Thank You for Subscribing to Tagqq!',
//     html: `
//       <div style="font-family: sans-serif;">
//         <h2> Thank You for Subscribing to Tagqq!</h2>
//         <p>Hello <strong>${email || 'User'}</strong>,</p>
//         <p>We’re excited to have you on board. You now have access to all our latest updates and features.</p>
//         <p>If you ever need help, just reply to this email.</p>
//         <br/>
//         <p>– The Tagqq Team</p>
//       </div>
//     `
//   });

//   return { message: 'Greeting email sent to verified user' };
// };




// import nodemailer from 'nodemailer';
// import User from '../../endUser/models/user.model.js';
// import { encrypt } from '../utils/encrypt.js';
// import dotenv from 'dotenv';

// dotenv.config();

// // Create nodemailer transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT),
//   secure: Number(process.env.SMTP_PORT) === 465,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// // Generate 6-digit OTP
// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// // Send OTP Email
// export const sendOtpToUser = async (email) => {
//   const user = await User.findOne({ where: { email } });
//   if (!user) throw new Error(`User with email ${email} not found`);
//   if (user.is_verified) throw new Error(`User is already verified`);

//   const otp = generateOTP();
//   const encryptedOtp = encrypt(otp);

//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM,
//     to: email,
//     subject: 'Your OTP for Tagqq Verification',
//     html: `
//       <div style="font-family: Arial, sans-serif;">
//         <h2>OTP Verification</h2>
//         <p>Hello <strong>${user.username || 'User'}</strong>,</p>
//         <p>Your One-Time Password (OTP) is:</p>
//         <h1 style="color: #2e7d32;">${otp}</h1>
//         <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
//         <p>– The Tagqq Team</p>
//       </div>
//     `
//   });

//   await Otp.create({
//     email,
//     otp: encryptedOtp,
//     expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
//   });

//   return { encryptedOtp };
// };

// // Send Greeting Email to Verified User
// export const sendGreetingToUser = async (email) => {
//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM,
//     to: email,
//     subject: 'Thank You for Subscribing to Tagqq!',
//     html: `
//       <div style="font-family: sans-serif;">
//         <h2>Thank You for Subscribing to Tagqq!</h2>
//         <p>Hello <strong>${email}</strong>,</p>
//         <p>We’re excited to have you on board. You now have access to all our latest updates and features.</p>
//         <p>If you ever need help, just reply to this email.</p>
//         <br/>
//         <p>– The Tagqq Team</p>
//       </div>
//     `
//   });

//   return { message: 'Greeting email sent to verified user' };
// };

// // Generic Alert Email Sender
// export const sendAlertEmail = async (email, subject, messageBody) => {
//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM,
//     to: email,
//     subject,
//     html: `
//       <div style="font-family: Arial, sans-serif;">
//         <h2>${subject}</h2>
//         <p>Hello <strong>${email}</strong>,</p>
//         <p>${messageBody}</p>
//         <p>– The Tagqq Team</p>
//       </div>
//     `
//   });

//   return { message: `Alert email sent to ${email}` };
// };

// // Specific Alerts
// export const sendOrderConfirmedAlert = (email) =>
//   sendAlertEmail(email, '✅ Your Order is Confirmed', 'Thank you for your purchase. Your order has been successfully confirmed.');

// export const sendPaymentSuccessAlert = (email) =>
//   sendAlertEmail(email, '💳 Payment Successful', 'Your payment was received successfully. Thank you for your trust!');

// export const sendPaymentFailedAlert = (email) =>
//   sendAlertEmail(email, '❌ Payment Failed', 'Unfortunately, your payment could not be processed. Please try again or contact support.');

// export const sendCustomAlert = (email, title, message) =>
//   sendAlertEmail(email, title, message);


import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import User from '../../endUser/models/user.model.js';
import { encrypt } from '../utils/encrypt.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtpToUser = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error(`User with email ${email} not found`);
  if (user.is_verified) throw new Error(`User is already verified`);

  const otp = generateOTP();
  const encryptedOtp = encrypt(otp);

  await transporter.sendMail({
    from: `"Tagqq Support" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Your OTP for Tagqq Verification',
    text: `Hello ${user.username || 'User'}, your OTP is ${otp}. This OTP is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 15px;">
        <h2>OTP Verification</h2>
        <p>Hello <strong>${user.username || 'User'}</strong>,</p>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="color: #2e7d32;">${otp}</h1>
        <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
        <hr style="border:none; border-top:1px solid #ddd;" />
        <small style="color:#888;">If you did not request this, you can ignore this email.</small>
      </div>
    `
  });

  return { encryptedOtp };
};

// ✅ Greeting email
export const sendGreetingToUser = async (email) => {
  await transporter.sendMail({
    from: `"Tagqq Support" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Thank You for Subscribing to Tagqq!',
    text: `Hello ${email}, thank you for subscribing to Tagqq! We're happy to have you onboard.`,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 15px;">
        <h2>Thank You for Subscribing to Tagqq!</h2>
        <p>Hello <strong>${email}</strong>,</p>
        <p>We’re excited to have you on board. You now have access to all our latest updates and features.</p>
        <p>If you ever need help, just reply to this email.</p>
        <hr style="border:none; border-top:1px solid #ddd;" />
        <small style="color:#888;">You are receiving this email because you registered with Tagqq.</small>
      </div>
    `
  });

  return { message: 'Greeting email sent to verified user' };
};

// ✅ Generic alert email
export const sendAlertEmail = async (email, subject, htmlMessage) => {
  const plainText = htmlMessage.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  await transporter.sendMail({
    from: `"Tagqq Support" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: subject.trim(),
    text: plainText,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 15px;">
        <h2>${subject}</h2>
        <p>Hello <strong>${email}</strong>,</p>
        ${htmlMessage}
        <br/>
        <hr style="border:none; border-top:1px solid #ddd;" />
        <small style="color:#888;">
          This email was sent by Tagqq to <strong>${email}</strong>. If you did not expect it, please ignore.
        </small>
      </div>
    `
  });

  return { message: `Alert email sent to ${email}` };
};

// ✅ Predefined alerts
export const sendOrderConfirmedAlert = (email) =>
  sendAlertEmail(email, 'Your Order is Confirmed', '<p>Thank you for your purchase. Your order has been successfully confirmed.</p>');

export const sendPaymentSuccessAlert = (email) =>
  sendAlertEmail(email, 'Payment Successful', '<p>Your payment was received successfully. Thank you for your trust!</p>');

export const sendPaymentFailedAlert = (email) =>
  sendAlertEmail(email, 'Payment Failed', '<p>Unfortunately, your payment could not be processed. Please try again or contact support.</p>');

export const sendCustomAlert = (email, title, message) =>
  sendAlertEmail(email, title, `<p>${message}</p>`);

