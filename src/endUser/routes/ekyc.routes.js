import express from 'express';
import ekycService from '../service/ekyc.service.js';
import {  authenticate } from '../../middleware/index.js';

const router = express.Router();

// Generate Aadhaar OTP (v2)
router.post('/generate-otp',  authenticate(['end_user' , 'captain' , 'admin', 'user_agent']), async (req, res) => {
  try {
    const { id_number } = req.body;
    const result = await ekycService.generateOtp({ id_number });
    return res.sendSuccess(result);
  } catch (err) {
    return res.sendError(err.message, err.status || 500);
  }
});

// Submit Aadhaar OTP (v2)
router.post('/submit-otp',  authenticate(['end_user', 'captain' , 'admin', 'user_agent']), async (req, res) => {
  try {
    const { request_id, otp, id_number } = req.body;
    const user_id = req.user?.id || null;
    const captain_id = req.captain?.id || null;
    const ekycResult = await ekycService.submitOtp({ request_id, otp, user_id , id_number, captain_id});
    return res.sendSuccess(ekycResult);
  } catch (err) {
    return res.sendError(err.message, err.status || 500);
  }
});

// Fetch full RC details
router.post(
  '/rc-full',
  authenticate(['end_user', 'admin', 'user_agent']),
  async (req, res) => {
    try {
      const { id_number, user_id: bodyUserId } = req.body;
      // pick up authenticated ID or body override
      const user_id = bodyUserId ?? req.user?.id;
      const created_by = req.user?.id ?? req.userAgent?.id ?? req.admin?.id;
      const owner_name = req.body.owner_name

      //—> guard clause for missing user_id
      if (!user_id) {
        return res.sendError('user_id is required', 400);
      }

      if (!id_number) {
        return res.sendError('id_number is required', 400);
      }

      const rcData = await ekycService.fetchRcFull({ id_number, user_id, created_by, owner_name });
      return res.sendSuccess(rcData);
    } catch (err) {
      return res.sendError(err.message, err.status || 500);
    }
  }
);


// in ekyc.router.js
router.post('/license',  authenticate(['end_user', 'admin', 'user_agent']), async (req, res) => {
  try {
    const { id_number, dob } = req.body; 
    const user_id = req.user?.id;
    const licenseData = await ekycService.fetchLicense({ id_number, dob, user_id });
    return res.sendSuccess(licenseData);
  } catch (err) {
    return res.sendError(err.message, err.status || 500);
  }
});

router.post(
  '/bank-verification',
  authenticate(['captain', 'admin', 'user_agent']),
  async (req, res) => {
    try {
      const { id_number, ifsc } = req.body;
      const user_id = req.user?.id || null  ;
      const captain_id = req.captain?.id || null;
      const bankData = await ekycService.fetchBankVerification({ id_number, ifsc, user_id, captain_id });
      return res.sendSuccess(bankData);
    } catch (err) {
      return res.sendError(err.message, err.status || 500);
    }
  }
);


export default router;
