import { z } from 'zod';
import twilioCallService from '../service/twilioCallLogs.js';
import twilioService from '../service/twillo.service.js';
import crypto from 'crypto';







// Secret key for encryption (32 bytes for AES-256)
const ENCRYPTION_SECRET = process.env.OTP_SECRET || '12345678901234567890123456789012'; // 32 chars

const sendOtpSchema = z.object({
  to: z.string(),
});

function encryptOtp(otp) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_SECRET), iv);
  let encrypted = cipher.update(otp);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

const emergencyCallSchema = z.object({
  name: z.string(),
  location: z.string(),
  hospital: z.string(),
  status: z.string(),
  photo: z.any().optional(),
  error_message: z.string().optional(),
});

// const relayCallSchema = z.object({
//   name: z.string(),
//   emergency_contact: z.string(),
//   victim_phone: z.string(),
//   status: z.string(),
//   photo: z.any().optional(),
//   error_message: z.string().optional(),
// });


export const relayCallSchema = z.object({
  emergencyContact: z.string()
    .min(10, "Emergency contact number is required")
    .regex(/^\+91\d{10}$/, "Emergency contact must be a valid Indian phone number with +91"),

  victimPhone: z.string()
    .min(10, "Victim phone number is required")
    .regex(/^\+91\d{10}$/, "Victim phone must be a valid Indian phone number with +91"),

  // name: z.string().min(1, "Name is required"),
  // photo: z.string(),
  // type: z.string().min(1, "Type is required"),
  // location: z.string().min(1, "Location is required"),
  // hospital: z.string().optional(),
});

const sendMessageSchema = z.object({
  to: z.string(),
  message: z.string(),
  // name: z.string().min(1, "Name is required"),
  // photo: z.string(),
  // type: z.string().min(1, "Type is required"),
  // location: z.string().min(1, "Location is required"),
  // hospital: z.string().min(1, "Hospital is required"),
});

const sendWhatsAppMessageSchema = z.object({
  to: z.string(),
  message: z.string(),
  name: z.string().min(1, "Name is required"),
  photo: z.string(),
  type: z.string().min(1, "Type is required"),
  location: z.string().min(1, "Location is required"),
  hospital: z.string().min(1, "Hospital is required"),
});

// 🆘 Emergency call
export const handleEmergencyCall = async (req, res) => {
  try {
    const body = emergencyCallSchema.parse(req.body);

    await twilioService.createCall({
      location: body.location,
      hospital: body.hospital,
    });

    const log = await twilioCallService.createEmergencyCall({
      call_sid: 'NA', // Optionally update with real SID
      ...body,
    });

    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const handleRelayCall = async (req, res) => {
  try {
    await twilioService.init();
    const body = relayCallSchema.parse(req.body);
    // const name = body.name ;
    // const type = body.type ;
    console.log("body: ", body)

    const data = await twilioService.relayCall(
      body.emergencyContact,
      body.victimPhone,
      // name,
      // body.photo,
      // type,
      // body.location,
      // body.hospital
    );

    // If you have sendSuccess set up to return `res`, you can keep it:
    return res.sendSuccess({ success: true, data });
    // Otherwise:
    // return res.status(200).json({ success: true, data });

  } catch (err) {
    console.error("RelayCall error:", err);
    // Option A: If sendError now returns res:
    // return res.sendError(400).json({ success: false, error: err.message });

    // Option B: Simpler without helper:
    return res.status(400).json({ success: false, error: err.message });
  }
};


// 💬 Send SMS
export const handleSendSMS = async (req, res) => {
  try {
    const { to, message,
      //  name, photo, type, location, hospital 
      } = sendMessageSchema.parse(req.body);

    const result = await twilioService.sendMessage(to, message,
      //  name, photo, type, location, hospital
      );

    if (!result.success) {
      throw new Error(result.error);
    }

    res.status(200).json({ success: true, sid: result.sid });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};


export const handleSendWhatapp = async (req, res) => {
  try {
    const { to, message, name, photo, type, location, hospital } = sendMessageSchema.parse(req.body);
    const result = await twilioService.sendWhatsAppMessage(to, message, name, photo, type, location, hospital);
        console.log("HIIIIIIIIIII")

    // if (!result.success) {
    //   throw new Error(result.error);
    // }

    res.status(200).json({ success: true, sid: result.sid });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const handlemetaWhatsApp = async (req, res) => {
  try {
    const {
      to,
      message,
      name,
      photo,
      type,
      location,
      hospital
    } = req.body;

    // Log input for debugging
    console.log("Incoming Meta WhatsApp request:", req.body);

    if (!to || typeof to !== 'string') {
      return res.status(400).json({ success: false, error: "'to' parameter is missing or invalid" });
    }

    const result = await twilioService.sendmetaWhatsAppMessage({
      to,
      name,
      message,
      photo,
      type,
      location,
      hospital
    });

    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Error in handleSendMetaWhatsApp:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Send Whatsapp Msg

export const handleSendMSG = async (req, res) => {
  try {
    const { to, message } = sendWhatsAppMessageSchema.parse(req.body);

    const result = await twilioService.sendWhatsAppMessage(to, message);

    if (!result.success) {
      throw new Error(result.error);
    }

    res.status(200).json({ success: true, sid: result.sid });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// 📄 Get all logs with pagination
export const getAllCallLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const logs = await twilioCallService.getAllCalls({ page, limit });

    res.status(200).json({ success: true, ...logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🔍 Get single log
export const getCallLogById = async (req, res) => {
  try {
    const id = req.params.id;
    const log = await twilioCallService.getCallById(id);
    res.status(200).json({ success: true, data: log });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

// ❌ Delete log
export const deleteCallLogById = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await twilioCallService.deleteCallById(id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};


export const sendOtpStateless = async (req, res) => {
  try {
    const { to } = sendOtpSchema.parse(req.body);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const message = `Your OTP is ${otp}. Do not share this with anyone.`;
    const result = await twilioService.sendMessage(to, message);

    if (!result.success) throw new Error(result.error);

    const encryptedOtp = encryptOtp(otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      encryptedOtp, 
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};