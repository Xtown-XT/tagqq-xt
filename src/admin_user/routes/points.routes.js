// src/routes/points.routes.js
import express, { Router } from 'express';
import {
  createPointsController,
  getAllPointsController,
  getPointsByIdController,
  getPointsByUserController,
  updatePointsController,
  softDeletePointsController,
  restorePointsController,
  hardDeletePointsController,
  getAnalytics
} from '../controller/points.controller.js';

const router = express.Router();

router.post('/points', createPointsController);
router.get('/points', getAllPointsController);
router.get('/pointscount', getAnalytics)
router.get('/points/:id', getPointsByIdController);
router.get('/points/user/:userId', getPointsByUserController);
router.put('/points/:id', updatePointsController);
router.delete('/points/:id', softDeletePointsController);
router.post('/points/:id/restore', restorePointsController);
router.delete('/points/:id/hard', hardDeletePointsController);

export default router;
