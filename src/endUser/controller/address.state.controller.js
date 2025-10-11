import {
  createState,
  getStateById,
  getAllStates,
  updateState,
  softDeleteState,
  restoreState
} from '../service/address.state.service.js';

// POST - Create State
export const create = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      is_active: true,
      created_by: req.user?.id ?? req.userAgent?.id ?? req.admin?.id
    };

    const state = await createState(payload);
    return res.sendSuccess(state, 'State created successfully', 201);
  } catch (error) {
    return res.sendError('Failed to create state', 400, error);
  }
};

// GET by ID
export const getById = async (req, res) => {
  try {
    const state = await getStateById(req.params.id);
    if (!state) {
      return res.sendError('State not found', 404);
    }
    return res.sendSuccess(state, 'State retrieved successfully');
  } catch (error) {
    return res.sendError('Failed to retrieve state', 400, error);
  }
};

// GET all
export const getAll = async (req, res) => {
  try {
    const {
      name,
      country_id,
      is_active,
      order = 'DESC'
    } = req.query;

    const filters = { name, country_id, is_active };

    const result = await getAllStates({
      filters,
      order: order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    });

    return res.sendSuccess(result, 'States retrieved successfully');
  } catch (error) {
    return res.sendError('Failed to retrieve states', 400, error);
  }
};


// PUT - Update State
export const update = async (req, res) => {
  try {
    const stateId = req.params.id;

    const updatePayload = {
      ...req.body,
      updated_by: req.user?.id ?? req.userAgent?.id ?? req.admin?.id
    };

    const updated = await updateState(stateId, updatePayload);

    if (!updated) {
      return res.sendError('State not found or inactive', 404);
    }

    return res.sendSuccess(updated, 'State updated successfully');
  } catch (error) {
    return res.sendError('Failed to update state', 400, error);
  }
};

// Soft Delete State
export const remove = async (req, res) => {
  try {
    const deleted = await softDeleteState(
      req.params.id,
      req.user?.id ?? req.userAgent?.id ?? req.admin?.id
    );
    if (!deleted) {
      return res.sendError('State already deleted or not found', 404);
    }
    return res.sendSuccess(null, 'State soft deleted');
  } catch (error) {
    return res.sendError('Failed to delete state', 400, error);
  }
};

// Restore State
export const restore = async (req, res) => {
  try {
    const restored = await restoreState(req.params.id);
    if (!restored) {
      return res.sendError('State not found or already active', 404);
    }
    return res.sendSuccess(null, 'State restored successfully');
  } catch (error) {
    return res.sendError('Failed to restore state', 400, error);
  }
};
