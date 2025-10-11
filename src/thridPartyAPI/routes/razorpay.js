import express from 'express';
import paymentController from '../controller/razorpay.js';
import {
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
  getPaymentByIdSchema,
  createUPIPaymentSchema,
  closeUPIPaymentSchema,
  fetchUPIPaymentSchema,
  fetchUPIPaymentsByCustomerSchema,
  fetchUPIPaymentsByPaymentIdSchema,
} from '../dto/razorpay.js'
import { validate,  authenticate } from "../../middleware/index.js";

const router = express.Router();

router.post(
  "/razorpay/order",
   authenticate(['end_user', 'admin', 'user_agent']),
  validate(createRazorpayOrderSchema),
  paymentController.createRazorpayOrder
);

router.post(
  "/razorpay/verify",
   authenticate(['end_user', 'admin', 'user_agent']),
  validate(verifyRazorpayPaymentSchema),
  paymentController.verifyPayment
);

router.get(
  "/:id",
   authenticate(['end_user', 'admin', 'user_agent']),
  validate(getPaymentByIdSchema),
  paymentController.getPaymentById
);

router.get("/",  
  authenticate(['end_user', 'admin', 'user_agent']),
  paymentController.getAllPayments );

router.post(
  '/upi',
  authenticate(['end_user', 'admin', 'user_agent']),
  validate(createUPIPaymentSchema),
  paymentController.createUPIPayment
);


router.post(
  '/upi/:upiPaymentId/close',
  authenticate(['end_user', 'admin', 'user_agent']),
  validate(closeUPIPaymentSchema),
  paymentController.closeUPIPaymentByUpiPaymentId
);

router.get(
  '/upi/:upiPaymentId',
  authenticate(['end_user', 'admin', 'user_agent']),
  validate(fetchUPIPaymentSchema),
  paymentController.fetchUPIPaymentByUpiPaymentid
);

router.get(
  '/upi/customer/:customerId',
  authenticate(['end_user', 'admin', 'user_agent']),
  validate(fetchUPIPaymentsByCustomerSchema),
  paymentController.fetchUPIPaymentsByCustomerId
);

router.get(
  '/upi/payment/:paymentId',
  authenticate(['end_user', 'admin', 'user_agent']),
  validate(fetchUPIPaymentsByPaymentIdSchema),
  paymentController.fectchUPIPaymentsByPyamentId
);

export default router;
