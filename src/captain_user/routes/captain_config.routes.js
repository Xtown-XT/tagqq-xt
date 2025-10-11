// routes/captain_config.routes.js
import express from 'express';
import {
  createCaptainConfigController,
  getCaptainConfigByIdController,
  updateCaptainConfigController,
  deleteCaptainConfigController,
  restoreCaptainConfigController,
  listCaptainConfigsController
} from '../controller/captain_config.controller.js';
import { validate, authenticate } from '../../middleware/index.js';
import {
  createCaptainConfigSchema,
  updateCaptainConfigSchema,
//   listCaptainConfigSchema
} from '../dto/captain_config.dto.js';

const router = express.Router();

// Create a new Captain Config
router.post(
  '/captain-configs',
  authenticate(['admin']),
  validate(createCaptainConfigSchema),
  createCaptainConfigController
);

// List / paginate Captain Configs
router.get(
  '/captain-configs',
  authenticate(['admin', 'captain']),
//   validate(listCaptainConfigSchema, 'query'),
  listCaptainConfigsController
);

// Get a single Captain Config by ID
router.get(
  '/captain-configs/:id',
  authenticate(['admin']),
  getCaptainConfigByIdController
);

// Update an existing Captain Config
router.put(
  '/captain-configs/:id',
  authenticate(['admin']),
  validate(updateCaptainConfigSchema),
  updateCaptainConfigController
);

// Soft-delete a Captain Config
router.delete(
  '/captain-configs/:id',
  authenticate(['admin']),
  deleteCaptainConfigController
);

// Restore a soft-deleted Captain Config
router.patch(
  '/captain-configs/restore/:id',
  authenticate(['admin']),
  restoreCaptainConfigController
);

export default router;
