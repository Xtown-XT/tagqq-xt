import express from 'express';
import {
  handleEmergencyCall,
  handleRelayCall,
  handleSendSMS,
  handleSendMSG,
  handlemetaWhatsApp,
  getAllCallLogs,
  getCallLogById,
  deleteCallLogById,
  sendOtpStateless,
  handleSendWhatapp
} from '../controller/twilio.controller.js'; // update path if needed

const router = express.Router();

router.post('/otp/send', sendOtpStateless);

// router.post('/call/emergency', handleEmergencyCall);

router.post('/call/relay', handleRelayCall);

router.post('/sms/send', handleSendSMS);
router.post('/meta/whatsapp', handlemetaWhatsApp);

router.post('/sms/whatsapp', handleSendWhatapp);


router.get('/calls', getAllCallLogs);

router.get('/calls/:id', getCallLogById);

router.delete('/calls/:id', deleteCallLogById);

export default router;
