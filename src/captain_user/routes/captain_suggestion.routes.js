import express from 'express';
import {
  createEnhancementController,
  getAllEnhancementsController,
  getEnhancementByIdController,
  updateEnhancementController,
  softDeleteEnhancementController,
  restoreEnhancementController,
  hardDeleteEnhancementController,
} from '../controller/captain_suggestion.controller.js';

import { authenticate } from '../../middleware/index.js';

const router = express.Router();

router.post('/enhancement',
  authenticate(['admin', 'captain', 'end_user']),
  createEnhancementController);

router.get('/enhancement',
  authenticate(['admin', 'captain', 'end_user']),
  getAllEnhancementsController);        

router.get('/enhancement/:id',
  authenticate(['admin', 'captain', 'end_user']),
  getEnhancementByIdController);

router.put('/enhancement/:id',
  authenticate(['admin', 'captain', 'end_user']),
  updateEnhancementController);

router.delete(
  '/enhancement/:id',
  authenticate(['admin', 'captain', 'end_user']),
  softDeleteEnhancementController
);
router.patch('/enhancement/restore/:id',
  authenticate(['admin', 'captain', 'end_user']),
  restoreEnhancementController);

router.delete('/enhancement/hard/:id',
  authenticate(['admin', 'captain', 'end_user']),
  hardDeleteEnhancementController);

export default router;
