import { z } from "zod";
import viCpassService from "../service/cpass.service.js";

// ✅ Schema
const initiateCallSchema = z.object({
  from: z.string().min(3, "Sender number required"),
  to: z.string().min(3, "Receiver number required"),
  message: z.string().optional(),
});

export const initiateVICall = async (req, res) => {
  try {
    const body = initiateCallSchema.parse(req.body);
    const result = await viCpassService.initiateCall(body);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

export const disconnectVICall = async (req, res) => {
  try {
    const { callId } = req.params;
    const result = await viCpassService.disconnectCall(callId);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

export const getVIToken = async (req, res) => {
  try {
    const token = await viCpassService.getBearerToken();
    res.status(200).json({ success: true, token });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
