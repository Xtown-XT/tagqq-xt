import { phonePePayout } from "../service/phonepe.service.js";

export async function createPhonePePayoutController(req, res) {
  try {
    const { upiId, amount, payeeName, message } = req.body;

    if (!upiId || !amount) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "UPI ID and amount are required."
      });
    }

    const data = await phonePePayout({ upiId, amount, payeeName, message });

    return res.status(200).json({
      success: true,
      message: "Withdrawal request has been successfully processed.",
      data: {
        merchantTransactionId: data.data.merchantTransactionId,
        amount: data.data.amount,
        merchantId: data.data.merchantId,
        providerReferenceId: data.data.providerReferenceId || null,
        status: data.code
      }
    });
  } catch (error) {
    console.error("❌ Payout Controller Error:", error.response?.data || error.message);
    const err = error.response?.data || { message: error.message };

    return res.status(500).json({
      success: false,
      code: err.code || "INTERNAL_SERVER_ERROR",
      message:
        err.message ||
        "There was an error processing your withdrawal. Please try again later.",
      data: err.data || {}
    });
  }
}


