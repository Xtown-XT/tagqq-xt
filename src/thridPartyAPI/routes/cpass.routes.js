import express from "express";
import {
  initiateVICall,
  disconnectVICall,
  getVIToken,
} from "../controller/cpass.controller.js";
import { authenticate } from "../../middleware/index.js";

const router = express.Router();

// Get Bearer Token
router.get("/token", 
    // authenticate(["admin"]), 
    getVIToken);

// Initiate Voice Call
router.post("/call/initiate",
    // authenticate(["admin", "captain"]),
     initiateVICall);

// Disconnect Call
router.post("/call/:callId/disconnect", 
    // authenticate(["admin"]),
     disconnectVICall);

export default router;
