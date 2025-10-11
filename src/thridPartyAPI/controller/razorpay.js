import razorpayService from "../service/razorpay.js";
import paymentService from "../service/payment.js";
import apiKeyService from "../service/apiKey.service.js"
import * as publicUrlService from "../../endUser/service/public_url.service.js"
import { getlatestCaptainConfigService } from "../../captain_user/service/captain_config.service.js"
import CaptainTransactionService from "../../captain_user/service/captainTransactionService.js";
import {
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
  getPaymentByIdSchema,
  createUPIPaymentSchema,
  closeUPIPaymentSchema,
  fetchUPIPaymentSchema,
  fetchUPIPaymentsByCustomerSchema,
  fetchUPIPaymentsByPaymentIdSchema,
} from '../dto/razorpay.js';
import { v4 as uuidv4 } from "uuid";
import { updatePublicUrl } from '../../endUser/service/public_url.service.js'
import { createOrderTrackingforrazerpay } from '../../endUser/service/order_tracking.service.js'
import Publicurl from '../../endUser/models/public_url.model.js'

// Initialize Razorpay keys (move this to app entry point if needed)

class PaymentController {
  // Create Razorpay order and save it in DB
  async createRazorpayOrder(req, res) {
    try {
      await razorpayService.init();
      // Zod parsing for safety
      const parsed = createRazorpayOrderSchema.body.parse(req.body);
      const { amount, currency = "INR", user_id, user_type, agent_id, payment_method, qrid } = parsed;

      const qrRecord = await Publicurl.findOne({
        where: { id: qrid, status: "Not Paid", user_id: null },


      });
      if (!qrRecord) {
        return res.sendError("This QR is not available for Active", 400);
      }
      console.log("User Details : " + req.user.id)
      const receipt = uuidv4(); // Unique receipt ID
      const razorpayOrder = await razorpayService.createPayment({ currency, receipt }, amount);
      const rezorpaykeys = await apiKeyService.getAPUIkeyByName('razorpay')
      console.log("Razorpay Keys : ", rezorpaykeys)

      // Save payment before actual success (status: created)
      const paymentData = {
        user_id: req.user.id || user_id,
        user_type,
        razorpay_order_id: razorpayOrder.id,
        amount: amount / 100,
        currency,
        status: "created",
        agent_id,
        receipt,
        payment_method,
        qrid
      };

      const savedPayment = await paymentService.createPayment(paymentData);



      return res.sendSuccess({
        razorpayOrder,
        payment: savedPayment,
        rezorpaykey: rezorpaykeys.keys.key_id,
      }, "Order created successfully");

    } catch (error) {
      console.error("❌ Error in createRazorpayOrder:", error.message);
      return res.sendError("Failed to create Razorpay order", 500,);
    }
  }


  // Verify payment signature and update DB
  async verifyPayment(req, res) {
    try {
      // 1) Initialize Razorpay client
      await razorpayService.init();


      // 2) Parse & validate request payload
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        qrid,
        // delivery_address_id,
        // count_of_qr
      } = verifyRazorpayPaymentSchema.body.parse(req.body);

      // 3) Verify signature with Razorpay
      const verificationMessage = await razorpayService.successPayment({
        orderCreationId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
      });

      // 4) Update the payment row (mark as captured + attach qrid)
      await paymentService.updatePaymentByRazorpayOrderId(
        razorpay_order_id,
        {
          status: "CAPTURED",
          razorpay_payment_id,
          razorpay_signature,
          qrid,
          // delivery_address_id,
          // count_of_qr: count_of_qr ?? 1,
        }
      );

      // 5) Reload the fresh record so qrid is populated
      const updatedPayment = await paymentService.getPaymentByRazorpayOrderId(
        razorpay_order_id,
        qrid
      );
      console.log("✅ Payment captured for user:", updatedPayment.user_id);
      console.log("📦 updatedPayment.qrid:", req.body.qrid);

      // 6) Update the PublicUrl (QR) status
      const publicStatus = await updatePublicUrl(req.body.qrid, {
        status: "Paid",
        user_id: updatedPayment.user_id,
      });

      // 7) Create an order‑tracking entry
      const orderTrack = await createOrderTrackingforrazerpay({
        status: "Processing",
        payment_id: updatedPayment.id,
        user_id: updatedPayment.user_id,
        is_active: true,
        // delivery_address_id,
        // count_of_qr: count_of_qr ?? 1,
      });
      console.log("✅ Order tracking created:", orderTrack.id);

      const publicurl = await publicUrlService.getPublicUrlById(req.body.qrid);
      console.log("Public URL:", publicurl);
      const captainid = publicurl.captain_id;
      console.log("captainid", captainid);
      let createcaptaintransaction = null;

      if (captainid) {
        const public_url_id = publicurl.id;
        const userid = publicurl.user_id;
        const latestCaptainConfig = await getlatestCaptainConfigService();

        if (!latestCaptainConfig) {
          return res.sendError("No active captain config found", 404);
        }

        const points = latestCaptainConfig.point_per_sale;
        const amount = latestCaptainConfig.point_per_rupee;
        const captainconfig_id= latestCaptainConfig.id;
        
        

        // ✅ Fix: assign to the outer variable, don't re-declare
        createcaptaintransaction = await CaptainTransactionService.create({
          user_id: userid,
          captain_id: captainid,
          public_url_id: public_url_id,
          points: points,
          amount : amount,
          captainconfigid : captainconfig_id
        });
      }


      // 8) Respond with everything
      return res.sendSuccess(
        { payment: updatedPayment, publicStatus, orderTrack, createcaptaintransaction },
        verificationMessage
      );
    } catch (error) {
      console.error("❌ Error in verifyPayment:", error.message);

      // Fallback—mark the Razorpay order as failed
      const {
        razorpay_order_id: orderId,
        razorpay_payment_id: payId,
        razorpay_signature: sig,
      } = req.body || {};

      if (orderId) {
        await paymentService.updatePaymentByRazorpayOrderId(orderId, {
          status: "failed",
          razorpay_payment_id: payId ?? null,
          razorpay_signature: sig ?? null,
        });
        console.log("⚠️ Marked payment failed for order:", orderId);
      }

      return res.sendError("Payment verification failed", 400);
    }
  }



  // Fetch payment by ID
  async getPaymentById(req, res) {
    try {
      // Validate path param
      await razorpayService.init();

      const { id } = getPaymentByIdSchema.params.parse(req.params);

      const payment = await paymentService.getPaymentByRazorpayOrderId(id);
      return res.sendSuccess(payment, "Payment fetched successfully");
    } catch (error) {
      console.error("❌ Error in getPaymentById:", error.message);
      return res.sendError("Failed to fetch payment", 400);
    }
  }

  //fetch all payment
  // payment.controller.js

  async getAllPayments(req, res, next) {
    try {
      // Build an options object from req.query, coercing types as needed
      await razorpayService.init();

      const {
        limit,
        page,
        search,
        user_id,
        agent_id,
        status,
        user_type,
        orderBy,
        orderDir,
      } = req.query;

      const options = {
        // req.query props are strings by default; convert numeric ones:
        limit: limit !== undefined ? Number(limit) : undefined,
        page: page !== undefined ? Number(page) : undefined,
        search,
        user_id,
        agent_id,
        status,
        user_type,
        orderBy,
        orderDir,
      };

      const payments = await paymentService.getAllPayments(options);

      return res.sendSuccess(payments, "All payments fetched successfully");
    } catch (error) {
      console.error("Error in getAllPayments:", error);
      return res.sendError("Failed to fetch payments", 500);
    }
  }

  async createUPIPayment(req, res) {
    try {
      await razorpayService.init();

      const { customerDetails, amount, agentDetails } = createUPIPaymentSchema.body.parse(req.body);
      const upiPayment = await razorpayService.createUPIPayment({ customerDetails, amount, agentDetails });
      return res.status(201).json({ message: 'UPI payment created', upiPayment });
    } catch (error) {
      console.error('❌ Error in createUPIPayment:', error.message);
      const status = error.status || 500;
      return res.status(status).json({ message: error.message });
    }
  }

  // Close UPI QR
  async closeUPIPaymentByUpiPaymentId(req, res) {
    try {
      await razorpayService.init();

      const { upiPaymentId } = closeUPIPaymentSchema.params.parse(req.params);
      const result = await razorpayService.closeUPIPaymentByUpiPaymentId(upiPaymentId);
      return res.status(200).json({ message: 'UPI payment closed', result });
    } catch (error) {
      console.error('❌ Error in closeUPIPaymentByUpiPaymentId:', error.message);
      const status = error.status || 500;
      return res.status(status).json({ message: error.message });
    }
  }

  // Fetch single UPI payment
  async fetchUPIPaymentByUpiPaymentid(req, res) {
    try {
      await razorpayService.init();

      const { upiPaymentId } = fetchUPIPaymentSchema.params.parse(req.params);
      const payment = await razorpayService.fetchUPIPaymentByUpiPaymentid(upiPaymentId);
      return res.status(200).json(payment);
    } catch (error) {
      console.error('❌ Error in fetchUPIPaymentByUpiPaymentid:', error.message);
      const status = error.status || 500;
      return res.status(status).json({ message: error.message });
    }
  }

  // Fetch UPI payments by customer
  async fetchUPIPaymentsByCustomerId(req, res) {
    try {
      await razorpayService.init();

      const { customerId } = fetchUPIPaymentsByCustomerSchema.params.parse(req.params);
      const payments = await razorpayService.fetchUPIPaymentsByCustomerId(customerId);
      return res.status(200).json(payments);
    } catch (error) {
      console.error('❌ Error in fetchUPIPaymentsByCustomerId:', error.message);
      const status = error.status || 500;
      return res.status(status).json({ message: error.message });
    }
  }

  // Fetch UPI payments by payment ID
  async fectchUPIPaymentsByPyamentId(req, res) {
    try {
      await razorpayService.init();

      const { paymentId } = fetchUPIPaymentsByPaymentIdSchema.params.parse(req.params);
      const payments = await razorpayService.fectchUPIPaymentsByPyamentId(paymentId);
      return res.status(200).json(payments);
    } catch (error) {
      console.error('❌ Error in fectchUPIPaymentsByPyamentId:', error.message);
      const status = error.status || 500;
      return res.status(status).json({ message: error.message });
    }
  }


}


export default new PaymentController();