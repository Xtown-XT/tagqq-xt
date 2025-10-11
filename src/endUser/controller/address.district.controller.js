import {
  createDistrict,
  getDistrictById,
  getAllDistricts,
  updateDistrict,
  softDeleteDistrict,
  restoreDistrict
} from '../service/address.district.service.js';

// POST - Create District
export const create = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      is_active: true,
      created_by: req.user?.id ?? req.userAgent?.id ?? req.admin?.id
    };

    const district = await createDistrict(payload);
    return res.sendSuccess(district, 'District created successfully', 201);
  } catch (error) {
    return res.sendError('Failed to create district', 400, error);
  }
};

// GET by ID
export const getById = async (req, res) => {
  try {
    const district = await getDistrictById(req.params.id);
    if (!district) {
      return res.sendError('District not found', 404);
    }
    return res.sendSuccess(district, 'District retrieved successfully');
  } catch (error) {
    return res.sendError('Failed to retrieve district', 400, error);
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
      state_id,
      is_active,
      is_master
    } = req.query;

    const filters = { name, state_id };

    if (is_active === 'true' || is_active === 'false') {
      filters.is_active = is_active;
    }

    if (is_master === 'true') {
      filters.is_master = 'true'; // pass flag to service
    }

    const result = await getAllDistricts({
      page: parseInt(page),
      limit: parseInt(limit),
      filters,
      order: order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    });

    return res.sendSuccess(result, 'Districts retrieved successfully');
  } catch (error) {
    return res.sendError('Failed to retrieve districts', 400, error);
  }
};


// PUT - Update District
export const update = async (req, res) => {
  try {
    const districtId = req.params.id;

    const updatePayload = {
      ...req.body,
      updated_by: req.user?.id ?? req.userAgent?.id ?? req.admin?.id
    };

    const updated = await updateDistrict(districtId, updatePayload);

    if (!updated) {
      return res.sendError('District not found or inactive', 404);
    }

    return res.sendSuccess(updated, 'District updated successfully');
  } catch (error) {
    return res.sendError('Failed to update district', 400, error);
  }
};

// Soft Delete District
export const remove = async (req, res) => {
  try {
    const deleted = await softDeleteDistrict(
      req.params.id,
      req.user?.id ?? req.userAgent?.id ?? req.admin?.id
    );
    if (!deleted) {
      return res.sendError('District already deleted or not found', 404);
    }
    return res.sendSuccess(null, 'District soft deleted');
  } catch (error) {
    return res.sendError('Failed to delete district', 400, error);
  }
};

// Restore District
export const restore = async (req, res) => {
  try {
    const restored = await restoreDistrict(req.params.id);
    if (!restored) {
      return res.sendError('District not found or already active', 404);
    }
    return res.sendSuccess(null, 'District restored successfully');
  } catch (error) {
    return res.sendError('Failed to restore district', 400, error);
  }
};
