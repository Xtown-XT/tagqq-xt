// routes/captain_withdraw.routes.js
import express from 'express';
import {
  createCaptainWithdrawTransactionController,
  getCaptainWithdrawTransactionByIdController,
  updateCaptainWithdrawTransactionController,
  deleteCaptainWithdrawTransactionController,
  restoreCaptainWithdrawTransactionController,
  listCaptainWithdrawTransactionsController
} from '../controller/captain_withdraw.controller.js';
import { validate, authenticate } from '../../middleware/index.js';
import {
  createCaptainWithdrawTransactionSchema,
  updateCaptainWithdrawTransactionSchema,
//   listCaptainWithdrawTransactionsSchema
} from '../dto/captain_withdraw.dto.js';

const router = express.Router();
// Create a new withdraw transaction (captains only)
router.post(
  '/captain_withdraw',
  authenticate(['admin','captain']),
  validate(createCaptainWithdrawTransactionSchema),
  createCaptainWithdrawTransactionController
);

// List / paginate withdraw transactions (admin or the captain themself)
router.get(
  '/captain_withdraw',
  authenticate(['admin', 'captain']),
//   validate(listCaptainWithdrawTransactionsSchema, 'query'),
  listCaptainWithdrawTransactionsController
);

// Get a single withdraw transaction by ID (admin or owner captain)
router.get(
  '/captain_withdraw/:id',
  authenticate(['admin', 'captain']),
  getCaptainWithdrawTransactionByIdController
);

// Update an existing withdraw transaction (e.g. status; admin only)
router.put(
  '/captain_withdraw/:id',
  authenticate(['admin']),
  validate(updateCaptainWithdrawTransactionSchema),
  updateCaptainWithdrawTransactionController
);

// Soft-delete a withdraw transaction (admin only)
router.delete(
  '/captain_withdraw/:id',
  authenticate(['admin']),
  deleteCaptainWithdrawTransactionController
);

// Restore a soft-deleted withdraw transaction (admin only)
router.patch(
  '/captain_withdraw/restore/:id',
  authenticate(['admin']),
  restoreCaptainWithdrawTransactionController
);

export default router;
