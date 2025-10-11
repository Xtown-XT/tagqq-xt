import { Payment } from '../models/index.js';
import apiKeyService from './apiKey.service.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import AppError from '../../utils/apiError.js';
import axios from 'axios';


class PaymentService {
    constructor() {
        this.payment = Payment;
        this.apiKeyService = apiKeyService;
        this.razorpayKey = null;
        this.razorpayInstance = null;
    }

    async init() {
        const data = await this.apiKeyService.getAPUIkeyByName("razorpay");
        if (!data) throw new AppError("Razorpay keys not found", 500);
        this.razorpayKey = data.get({ plain: true });

        this.razorpayInstance = new Razorpay({
            key_id: this.razorpayKey.keys.key_id,
            key_secret: this.razorpayKey.keys.key_secret,
            debug: true


        });
    }

    async createPayment(obj, amount) {
        try {
            const order = await this.razorpayInstance.orders.create({
                amount,
                currency: obj.currency,
                receipt: obj.receipt,
            });

            if (!order) {
                throw new AppError("Failed to create Razorpay order", 502);
            }

            return order;
        } catch (error) {
            console.error("createPayment Error:", error);
            if (error instanceof AppError) throw error;
            throw new AppError("Internal error in creating payment", 500, { original: error.message });
        }
    }

    async successPayment({ orderCreationId, razorpayPaymentId, razorpayOrderId, razorpaySignature }) {
        try {
            const generatedSignature = crypto
                .createHmac("sha256", this.razorpayKey.keys.key_secret)
                .update(`${orderCreationId}|${razorpayPaymentId}`)
                .digest("hex");

            if (generatedSignature !== razorpaySignature) {
                throw new AppError("Signature verification failed", 400, {
                    razorpayPaymentId,
                    razorpayOrderId,
                });
            }

            return `Payment verified for Payment ID ${razorpayPaymentId}`;
        } catch (error) {
            console.error("successPayment Error:", error);
            if (error instanceof AppError) throw error;
            throw new AppError("Payment verification failed", 500, { original: error.message });
        }
    }

    async createUPIPayment({ customerDetails, amount, agentDetails }) {
    try {
        // **Validation**: Check for required fields
        if (!customerDetails?.id || !amount || !agentDetails?.name) {
            throw new AppError("Missing required fields", 400);
        }

        // **Debugging**: Add Axios request interceptor for logging
        axios.interceptors.request.use(req => {
            console.log("🛰️ Axios Request:");
            console.log("➡️ URL:", req.url);
            console.log("➡️ Method:", req.method);
            console.log("➡️ Headers:", req.headers);
            console.log("➡️ Data:", req.data);
            return req;
        });

        // **Authentication**: Load Razorpay keys if not already initialized
        if (!this.razorpayKey) {
            await this.init();
        }

        const { key_id, key_secret } = this.razorpayKey.keys;
        const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');
        console.log("hiiiiiiiiiiaaa: ",key_id)

        // **Customer Handling**: Create or retrieve Razorpay customer
        let razorpayCustomerId = customerDetails.razorpay_customer_id;

        if (!razorpayCustomerId) {
            try {
                const customerPayload = {
                    name: customerDetails.name || 'Unknown',
                    email: customerDetails.email || 'noemail@tagqq.in',
                    contact: customerDetails.phone || '9999999999',
                };

                const customerResponse = await axios.post(
                    'https://api.razorpay.com/v1/customers',
                    customerPayload,
                    {
                        headers: {
                            Authorization: `Basic ${auth}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                razorpayCustomerId = customerResponse.data?.id;

                // Optionally save to database (uncomment and adjust as needed)
                // await User.update(
                //     { razorpay_customer_id: razorpayCustomerId },
                //     { where: { id: customerDetails.id } }
                // );
            } catch (err) {
                const desc = err.response?.data?.error?.description;
                if (desc === 'Customer already exists for the merchant') {
                    const existing = await axios.get(
                        `https://api.razorpay.com/v1/customers?email=${customerDetails.email}`,
                        {
                            headers: {
                                Authorization: `Basic ${auth}`,
                            },
                        }
                    );

                    razorpayCustomerId = existing.data?.items?.[0]?.id;
                    if (!razorpayCustomerId) {
                        throw new AppError("Failed to retrieve Razorpay customer", 502);
                    }
                } else {
                    throw err;
                }
            }
        }

        // **QR Code Expiry**: Set close_by timestamp (5 minutes from now)
        const closeBy = Math.floor(Date.now() / 1000) + 5 * 60;

        // **Payload**: Prepare data for QR code creation
        const payload = {
            type: "upi_qr",
            name: "TagQQ Payments",
            usage: "single_use",
            currency: "INR",
            fixed_amount: true,
            payment_amount: amount * 100, // Correct field name
            description: `Payment for Agent ${agentDetails.name}`,
            close_by: closeBy,
            notes: {
                agentId: agentDetails.id,
            },
        };

        // **API Call**: Create UPI QR code using Razorpay
        const qrResponse = await axios.post(
            'https://api.razorpay.com/v1/qr_codes',
            payload,
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const upiPayment = qrResponse.data;

        // **Validation**: Ensure QR code creation was successful
        if (!upiPayment?.id) {
            throw new AppError("UPI payment creation failed", 502, {
                customerId: customerDetails.id,
                agentId: agentDetails.id,
            });
        }

        // **Database Storage**: Save payment details (adjust based on your ORM)
        await Payment.create({
            user_id: customerDetails.id,
            user_type: 'USER',
            razorpay_order_id: null,
            razorpay_payment_id: null,
            razorpay_signature: null,
            amount,
            currency: 'INR',
            status: 'CREATED',
            agent_id: agentDetails.id,
            receipt: upiPayment.id,
            payment_method: 'UPI',
        });

        // **Response**: Return the UPI payment details
        return upiPayment;
    } catch (error) {
        // **Enhanced Error Logging**: Log detailed error information
        console.error("createUPIPayment Error:", error);
        if (error.response) {
            console.error("Response Data:", error.response.data);
            console.error("Response Status:", error.response.status);
            console.error("Response Headers:", error.response.headers);
        }

        // **Error Handling**: Throw appropriate error
        if (error instanceof AppError) throw error;
        throw new AppError("Internal error creating UPI payment", 500, {
            original: error.response?.data || error.message,
        });
    }
}






    async closeUPIPaymentByUpiPaymentId(upiPaymentId) {
        try {
            if (!upiPaymentId || typeof upiPaymentId !== "string") {
                throw new AppError("Invalid UPI Payment ID", 400);
            }

            const result = await this.razorpayInstance.qrCode.close(upiPaymentId);

            if (!result?.id) {
                throw new AppError("Failed to close UPI QR", 502, { upiPaymentId });
            }

            return result;
        } catch (error) {
            console.error("closeUPIPaymentByUpiPaymentId Error:", error);
            if (error instanceof AppError) throw error;
            throw new AppError("Internal error closing UPI payment", 500, { original: error.message });
        }
    }

    async fetchUPIPaymentByUpiPaymentid(upiPaymentId) {
        try {
            if (!upiPaymentId || typeof upiPaymentId !== "string") {
                throw new AppError("Invalid UPI Payment ID", 400);
            }

            const result = await this.razorpayInstance.qrCode.fetch(upiPaymentId);

            if (!result?.id) {
                throw new AppError("Failed to fetch UPI QR", 502, { upiPaymentId });
            }

            return result;
        } catch (error) {
            console.error("fetchUPIPaymentByUpiPaymentid Error:", error);
            if (error instanceof AppError) throw error;
            throw new AppError("Internal error fetching UPI payment", 500, { original: error.message });
        }
    }

    async fetchUPIPaymentsByCustomerId(customerId) {
        try {
            if (!customerId) {
                throw new AppError("Customer ID is required", 400);
            }

            const result = await this.razorpayInstance.qrCode.all({ customer_id: customerId });

            if (!result) {
                throw new AppError("Failed to fetch UPI QR codes", 502, { customerId });
            }

            return result;
        } catch (error) {
            console.error("fetchUPIPaymentsByCustomerId Error:", error);
            if (error instanceof AppError) throw error;
            throw new AppError("Internal error fetching UPI payments", 500, { original: error.message });
        }
    }

    async fectchUPIPaymentsByPyamentId(paymentId) {
        try {
            if (!paymentId) {
                throw new AppError("Payment ID is required", 400);
            }

            const result = await this.razorpayInstance.qrCode.all({ payment_id: paymentId });

            if (!result || result.length === 0) {
                throw new AppError("No UPI payments found", 404, { paymentId });
            }

            return result;
        } catch (error) {
            console.error("fectchUPIPaymentsByPyamentId Error:", error);
            if (error instanceof AppError) throw error;
            throw new AppError("Internal error fetching payment by ID", 500, { original: error.message });
        }
    }
}

export default new PaymentService();







// const paymentService = new  PaymentService();




// (async () => {
//     try {
//         // Step 1: Initialize the service (loads API keys and sets up Razorpay instance)
//         await paymentService.init();
//         console.log("✅ Razorpay API Key Loaded:", paymentService.razorpayKey);

//         // Step 2: Create a test order
//         const testOrderData = {
//             currency: "INR",
//             receipt: "test_receipt_123"
//         };
//         const amountInPaise = 50000; // ₹500.00

//         const createdOrder = await paymentService.createPayment(testOrderData, amountInPaise);
//         console.log("✅ Razorpay Order Created:", createdOrder);

//         // Step 3: Simulate payment verification (fill these with real test data or mock)
//         // const verificationData = {
//         //     orderCreationId: createdOrder.id,
//         //     razorpayPaymentId: "fake_payment_id",      // Replace with real one in production test
//         //     razorpayOrderId: createdOrder.id,
//         //     razorpaySignature: "fake_signature"         // Replace with valid signature to test success
//         // };

//         // const verificationResult = await paymentService.successPayment(verificationData);
//         // console.log("✅ Payment Verification Result:", verificationResult);

//     } catch (err) {
//         console.error("❌ Test Failed:", err.message);
//     }
// })();

