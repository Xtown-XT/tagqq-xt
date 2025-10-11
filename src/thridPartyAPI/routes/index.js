import apiKeyRouter from "./apiKey.routes.js";
import razorpayRouter from "./razorpay.js";
import smtpRouter from "./smtp.routes.js";
import twilloRouter from "./twilio.routes.js"
import phonepeRouter from "./phonepe.routes.js";
import { Router } from "express";




const router = Router();


// Mount the API key routes
router.use("/thirdpartyapi", apiKeyRouter);
router.use("/thirdpartyapi", razorpayRouter);
router.use("/thirdpartyapi", smtpRouter);
router.use("/thirdpartyapi", twilloRouter);
router.use("/thirdpartyapi", phonepeRouter);






export default router;
