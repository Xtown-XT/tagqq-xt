import {
  createBloodGroup,
  getBloodGroupById,
  getAllBloodGroups,
  updateBloodGroup,
  softDeleteBloodGroup,
  restoreBloodGroup
} from '../service/bloodgroup.service.js';

// POST - Create Blood Group
export const create = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      is_active: true,
      created_by: req.user?.id ?? req.userAgent?.id ?? req.admin?.id
    };

    const bloodGroup = await createBloodGroup(payload);
    return res.sendSuccess(bloodGroup, 'Blood group created successfully', 201);
  } catch (error) {
    return res.sendError('Failed to create blood group', 400, error);
  }
};

// GET by ID
export const getById = async (req, res) => {
  try {
    const bloodGroup = await getBloodGroupById(req.params.id);
    if (!bloodGroup) {
      return res.sendError('Blood group not found', 404);
    }
    return res.sendSuccess(bloodGroup, 'Blood group retrieved successfully');
  } catch (error) {
    return res.sendError('Failed to retrieve blood group', 400, error);
  }
};

// GET all
export const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      order = 'DESC',
      name,
      is_active
    } = req.query;

    const filters = { name };

    if (is_active === 'true' || is_active === 'false') {
      filters.is_active = is_active;
    }

    const result = await getAllBloodGroups({
      page: parseInt(page),
      limit: parseInt(limit),
      filters,
      order: order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    });

    return res.sendSuccess(result, 'Blood groups retrieved successfully');
  } catch (error) {
    return res.sendError('Failed to retrieve blood groups', 400, error);
  }
};

// PUT - Update Blood Group
export const update = async (req, res) => {
  try {
    const groupId = req.params.id;

    const updatePayload = {
      ...req.body,
      updated_by: req.user?.id ?? req.userAgent?.id ?? req.admin?.id
    };

    const updated = await updateBloodGroup(groupId, updatePayload);

    if (!updated) {
      return res.sendError('Blood group not found or inactive', 404);
    }

    return res.sendSuccess(updated, 'Blood group updated successfully');
  } catch (error) {
    return res.sendError('Failed to update blood group', 400, error);
  }
};

// Soft Delete Blood Group
export const remove = async (req, res) => {
  try {
    const deleted = await softDeleteBloodGroup(
      req.params.id,
      req.user?.id ?? req.userAgent?.id ?? req.admin?.id
    );
    if (!deleted) {
      return res.sendError('Blood group already deleted or not found', 404);
    }
    return res.sendSuccess(null, 'Blood group soft deleted');
  } catch (error) {
    return res.sendError('Failed to delete blood group', 400, error);
  }
};

// Restore Blood Group
export const restore = async (req, res) => {
  try {
    const restored = await restoreBloodGroup(req.params.id);
    if (!restored) {
      return res.sendError('Blood group not found or already active', 404);
    }
    return res.sendSuccess(null, 'Blood group restored successfully');
  } catch (error) {
    return res.sendError('Failed to restore blood group', 400, error);
  }
};
