// service/phonepe.service.js
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import APIkeyService from "./apiKey.service.js";

const ENVIRONMENTS = {
  uat: "https://mercury-uat.phonepe.com",
  prod: "https://mercury-t2.phonepe.com"
};
const BASE_URL = ENVIRONMENTS[process.env.NODE_ENV || "uat"];
const PAYOUT_PATH = "/v3/credit/transfer";

let MERCHANT_ID, SALT_KEY, SALT_INDEX, CALLBACK_URL;

async function loadPGConfig() {
  const apivalue = await APIkeyService.getAPUIkeyByName("phonepe");
  if (!apivalue) throw new Error("PhonePe PG keys not found");

  console.log("Raw API keys:", apivalue.keys);

  let keys;
  try {
    keys = typeof apivalue.keys === "string" ? JSON.parse(apivalue.keys) : apivalue.keys;
  } catch (error) {
    throw new Error(`Failed to parse PhonePe keys: ${error.message}`);
  }

  MERCHANT_ID = keys.merchantId || process.env.PHONEPE_MERCHANT_ID;
  SALT_KEY = keys.key_secret || process.env.PHONEPE_SALT_KEY;
  SALT_INDEX = keys.saltIndex || process.env.PHONEPE_SALT_INDEX || "1";
  CALLBACK_URL = keys.callbackUrl || process.env.PHONEPE_CALLBACK_URL || "https://tagqq.onrender.com/api/v1/onscan/thirdpartyapi/phonepe/callback";

  if (!MERCHANT_ID || !SALT_KEY || !CALLBACK_URL) {
    throw new Error(
      `Missing required PhonePe configuration: ${JSON.stringify({
        MERCHANT_ID: !!MERCHANT_ID,
        SALT_KEY: !!SALT_KEY,
        CALLBACK_URL: !!CALLBACK_URL
      })}`
    );
  }

  console.log("✅ Loaded PG Config:", {
    MERCHANT_ID: "****",
    SALT_INDEX: "****",
    CALLBACK_URL: "****"
  });
}

function computeXVerify(base64Payload) {
  const toSign = base64Payload + PAYOUT_PATH + SALT_KEY;
  const hash = crypto.createHash("sha256").update(toSign).digest("hex");
  return `${hash}###${SALT_INDEX}`;
}

export async function phonePePayout({ upiId, amount, payeeName, message }) {
  if (!MERCHANT_ID) await loadPGConfig();

  // Input validation
  if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
    throw new Error("Invalid UPI ID format");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }

  const transactionId = `TXN_${uuidv4()}`;
  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: transactionId,
    amount: Math.round(amount * 100),
    transferMode: "UPI",
    payeeType: "UPI_ID",
    payeeAddress: upiId,
    payeeName: payeeName || "Customer",
    message: message || "Withdrawal",
    callbackUrl: CALLBACK_URL
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  const xVerify = computeXVerify(base64Payload);

  const headers = {
    "Content-Type": "application/json",
    "X-VERIFY": xVerify
  };

  console.log("🔗 API URL:", `${BASE_URL}${PAYOUT_PATH}`);
  console.log("📦 Payload:", payload);
  console.log("📦 Base64 Payload:", base64Payload);
  console.log("🔑 Headers:", headers);

  try {
    const response = await axios.post(
      `${BASE_URL}${PAYOUT_PATH}`,
      { request: base64Payload },
      { headers }
    );

    if (!response.data?.data) {
      throw new Error("Invalid response from PhonePe API");
    }

    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("PhonePe API endpoint not found. Verify the endpoint URL.");
    }
    throw new Error(`PhonePe API error: ${error.response?.data?.message || error.message}`);
  }
}