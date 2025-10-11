
// src/app/captain_profile/routes/captain_profile.routes.js
import express from "express";
import {
  createCaptainProfileController,
  getAllCaptainProfilesController,
  getCaptainProfileByIdController,
  updateCaptainProfileController,
  removeCaptainProfileController,
  restoreCaptainProfileController,
  getCaptainProfileCompletionController,
} from "../controller/captain_profile.controller.js";
import { authenticate } from '../../middleware/index.js';

const router = express.Router();

router.post("/captain_profile",
  authenticate(['admin', 'captain']),
  createCaptainProfileController);

router.get("/captain_profile",
  authenticate(['admin', 'captain']),
  getAllCaptainProfilesController);

router.get("/captain_profile/:id",
  authenticate(['admin', 'captain']),
  getCaptainProfileByIdController);

router.put("/captain_profile/:id",
  authenticate(['admin', 'captain']),
  updateCaptainProfileController);

router.get("/completion/:id",
  authenticate(['admin', 'captain']),
  getCaptainProfileCompletionController);

router.delete("/captain_profile/:id",
  authenticate(['admin']),
  removeCaptainProfileController);

router.patch("/captain_profile/restore/:id",
  authenticate(['admin']),
  restoreCaptainProfileController);

export default router;

