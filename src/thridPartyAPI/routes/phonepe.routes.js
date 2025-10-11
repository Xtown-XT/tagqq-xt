import express from 'express';
import { createPhonePePayoutController } from '../controller/phonepe.controller.js';
import { validate,  authenticate } from "../../middleware/index.js";

const router = express.Router();

router.post('/phonepe/payment',authenticate(['captain']), createPhonePePayoutController);

router.post("/phonepe/callback", async (req, res) => {
  try {
    console.log("✅ PhonePe Callback Received:", req.body);

    const {
      merchantId,
      transactionId,
      merchantTransactionId,
      amount,
      code,
      message
    } = req.body;

    // ✅ Update DB with new status
    if (code === "PAYMENT_SUCCESS") {
      console.log(`✅ Payout Success for TXN: ${merchantTransactionId}`);
      await updateTransactionStatus(merchantTransactionId, "SUCCESS");
    } else {
      console.log(`❌ Payout Failed for TXN: ${merchantTransactionId}`);
      await updateTransactionStatus(merchantTransactionId, "FAILED");
    }

    // ✅ Always respond 200 to PhonePe
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Callback Processing Error:", error.message);
    res.status(500).json({ success: false });
  }
});

// Dummy DB function
async function updateTransactionStatus(txnId, status) {
  console.log(`DB Update: ${txnId} → ${status}`);
}


export default router;
