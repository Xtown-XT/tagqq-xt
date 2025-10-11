//userConfig.controller.js

import {
  createUserInfo,
  getUserConfigs,
  getUserConfigById,
  updateUserConfigById,
  softDeleteUserConfig,
  restoreUserConfig,
  deleteUserConfigById,
  getUserConfigByUserId
} from '../service/userConfig.service.js';

// POST /enduser
export const registerUser = async (req, res) => {
  try {
    const {
      user_id,
      has_profile,
      has_vehicle,
      has_aadhar,
      has_license,
      has_emergency
    } = req.body;

    if (!user_id) {
      return res.sendError('Missing required field: user_id', 400);
    }

    const created_by = req.user?.id ?? req.userAgent?.id ?? req.admin?.id;

    const userConfig = await createUserInfo({
      user_id,
      has_profile,
      has_vehicle,
      has_aadhar,
      has_license,
      has_emergency,
      created_by,
      updated_by: created_by
    });

    return res.sendSuccess({ data: userConfig }, 'UserConfig created successfully');
  } catch (error) {
    return res.sendError('Failed to create UserConfig', 500, error);
  }
};


// GET /enduser
export const getAll = async (req, res) => {
  try {
    const {
      filter = 'all',
      page = 1,
      limit = 10,
      orderBy = 'desc'
    } = req.query;

    let userId = null;

    if (req.user) {
      // If end user is logged in, restrict to their data only
      userId = req.user.id;
    } else if (req.admin) {
      // If admin, allow all users' data (userId = null)
      userId = null;
    } else {
      return res.sendError?.('Unauthorized access', 403)
        ?? res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const result = await getUserConfigs({
      filter,
      page: parseInt(page),
      limit: parseInt(limit),
      orderBy,
      userId
    });

    return res.sendSuccess(result, 'UserConfigs retrieved successfully');
  } catch (error) {
    return res.sendError('Failed to retrieve UserConfigs', 500, error);
  }
};


// GET /enduser/:id
export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await getUserConfigById(id);
    return res.sendSuccess({ userConfig: config }, 'UserConfig retrieved successfully');
  } catch (error) {
    return res.sendError('UserConfig not found', 404, error);
  }
};

// PUT /enduser/:id
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updated_by = req.user?.id ?? req.userAgent?.id ?? req.admin?.id;

    const updateData = {
      ...req.body,
      updated_by
    };

    const updated = await updateUserConfigById(id, updateData);

    return res.sendSuccess({ userConfig: updated }, 'UserConfig updated successfully');
  } catch (error) {
    return res.sendError('Failed to update UserConfig', 500, error);
  }
};

// PATCH /enduser/:id/deactivate
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await softDeleteUserConfig(id);

    if (result.status === 'not_found') {
      return res.sendError('UserConfig not found', 404);
    }

    if (result.status === 'already_inactive') {
      return res.sendError('UserConfig is already deactivated', 400);
    }

    return res.sendSuccess(null, 'UserConfig deactivated successfully');
  } catch (error) {
    return res.sendError('Failed to deactivate UserConfig', 500, error);
  }
};

// PATCH enduser/:id/activate
export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await restoreUserConfig(id);

    if (result.status === 'not_found') {
      return res.sendError('UserConfig not found', 404);
    }

    if (result.status === 'already_active') {
      return res.sendError('UserConfig is already active', 400);
    }

    return res.sendSuccess(null, 'UserConfig restored successfully');
  } catch (error) {
    return res.sendError('Failed to restore UserConfig', 500, error);
  }
};

// DELETE /enduser/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteUserConfigById(id);

    return res.sendSuccess(result, 'UserConfig deleted permanently');
  } catch (error) {
    return res.sendError('Failed to delete UserConfig', 500, error);
  }
};

// GET /userconfig/me - for logged-in user
export const getMyUserConfig = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.sendError('Unauthorized: User not found in token', 401);
    }

    const config = await getUserConfigByUserId(userId);

    return res.sendSuccess({ userConfig: config }, 'UserConfig fetched successfully');
  } catch (error) {
    return res.sendError('Failed to fetch UserConfig', 500, error.message);
  }
};
