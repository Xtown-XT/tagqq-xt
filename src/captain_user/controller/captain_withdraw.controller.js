// controllers/captain_withdraw.controller.js

import {
  createCaptainWithdrawTransactionService,
  getCaptainWithdrawTransactionByIdService,
  updateCaptainWithdrawTransactionService,
  deleteCaptainWithdrawTransactionService,
  restoreCaptainWithdrawTransactionService,
  getCaptainWithdrawTransactionsService
} from '../service/captain_withdraw.service.js';

// Create a new withdraw transaction
export const createCaptainWithdrawTransactionController = async (req, res) => {
  try {
    // Assume the captain is authenticated and available on req.user
    console.log("req.body :", req.body)
    const payload = {
      ...req.body,
      captain_id: req.captain?.id ?? req.body.captain_id,
    };
    const tx = await createCaptainWithdrawTransactionService(payload);
    return res.sendSuccess({ data: tx }, 'Withdrawal transaction created successfully');
  } catch (error) {
    console.error('Error in createCaptainWithdrawTransactionController:', error);
    return res.sendError(error.message, 500);
  }
};



// Retrieve a single withdraw transaction by ID
export const getCaptainWithdrawTransactionByIdController = async (req, res) => {
  try {
    // allow optional ?includeDeleted=true query to fetch soft‐deleted
    const paranoid = req.query.includeDeleted === 'true' ? false : true;
    const tx = await getCaptainWithdrawTransactionByIdService(req.params.id, { paranoid });
    return res.sendSuccess({ data: tx }, 'Withdrawal transaction retrieved successfully');
  } catch (error) {
    console.error('Error in getCaptainWithdrawTransactionByIdController:', error);
    return res.sendError(error.message, 404);
  }
};

// Update an existing withdraw transaction
export const updateCaptainWithdrawTransactionController = async (req, res) => {
  try {
    const updated = await updateCaptainWithdrawTransactionService(req.params.id, req.body);
    return res.sendSuccess({ data: updated }, 'Withdrawal transaction updated successfully');
  } catch (error) {
    console.error('Error in updateCaptainWithdrawTransactionController:', error);
    return res.sendError(error.message, 400);
  }
};

// Soft-delete a withdraw transaction
export const deleteCaptainWithdrawTransactionController = async (req, res) => {
  try {
    await deleteCaptainWithdrawTransactionService(req.params.id);
    return res.sendSuccess({}, 'Withdrawal transaction deleted successfully');
  } catch (error) {
    console.error('Error in deleteCaptainWithdrawTransactionController:', error);
    return res.sendError(error.message, 404);
  }
};

// Restore a soft-deleted withdraw transaction
export const restoreCaptainWithdrawTransactionController = async (req, res) => {
  try {
    const restored = await restoreCaptainWithdrawTransactionService(req.params.id);
    return res.sendSuccess({ data: restored }, 'Withdrawal transaction restored successfully');
  } catch (error) {
    console.error('Error in restoreCaptainWithdrawTransactionController:', error);
    return res.sendError(error.message, 404);
  }
};

// List/paginate withdraw transactions
export const listCaptainWithdrawTransactionsController = async (req, res) => {
  try {
    const {
      captainId,
      status,
      startDate,
      endDate,
      includeDeleted = 'false',
      page = '1',
      limit = '20'
    } = req.query;

    const result = await getCaptainWithdrawTransactionsService({
      captainId,
      status,
      startDate,
      endDate,
      includeDeleted: includeDeleted === 'true',
      page: Number(page),
      limit: Number(limit)
    });

    return res.sendSuccess(
      {
        data: result.rows,
        meta: {
          total: result.count,
          page: Number(page),
          limit: Number(limit)
        }
      },
      'Withdrawal transactions retrieved successfully'
    );
  } catch (error) {
    console.error('Error in listCaptainWithdrawTransactionsController:', error);
    return res.sendError('Failed to retrieve withdrawal transactions', 500);
  }
};

// Export for routing
export const captainWithdrawController = {
  create: createCaptainWithdrawTransactionController,
  getById: getCaptainWithdrawTransactionByIdController,
  update: updateCaptainWithdrawTransactionController,
  delete: deleteCaptainWithdrawTransactionController,
  restore: restoreCaptainWithdrawTransactionController,
  list: listCaptainWithdrawTransactionsController
};
