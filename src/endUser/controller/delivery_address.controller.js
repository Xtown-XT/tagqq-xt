import {
  createDeliveryAddress,
  getDeliveryAddressById,
  getAllDeliveryAddresses,
  updateDeliveryAddress,
  softDeleteDeliveryAddress,
  restoreDeliveryAddress
} from '../service/delivery_address.service.js';

// POST
export const create = async (req, res) => {
  try {
    const userId = req.body?.user_id ?? req.user?.id;

    if (!userId) {
      return res.sendError('Unauthorized: user ID not found', 401);
    }

    const payload = {
      ...req.body,
      user_id: userId,
      createdBy: req.user?.id ?? req.userAgent?.id ?? req.admin?.id,
      is_active: true,
    };

    const address = await createDeliveryAddress(payload);
    return res.sendSuccess(address, 'Delivery address created successfully', 201);
  } catch (error) {
    return res.sendError('Failed to create delivery address', 400, error);
  }
};

// GET by ID
export const getById = async (req, res) => {
  try {
    const address = await getDeliveryAddressById(req.params.id);

    if (!address) {
      return res.sendError('Address not found', 404);
    }

    return res.sendSuccess(address, 'Address retrieved successfully');
  } catch (error) {
    return res.sendError('Failed to retrieve address', 400, error);
  }
};

// GET all
export const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      order = 'DESC',
      district,
      state,
      country,
      pincode,
      is_active,
      user_id // optional, admin only
    } = req.query;

    const filters = { district, state, country, pincode };

    if (is_active === 'true' || is_active === 'false') {
      filters.is_active = is_active;
    }

    // Admin access
    let user = null;
    if (req.admin) {
      if (user_id) filters.user_id = user_id;
      user = req.admin; // decoded token
      user.role = 'admin'; // manually assign role, since it's not set in your middleware
    } else if (req.user) {
      // End user access
      filters.user_id = req.user.id;
      user = req.user;
      user.role = 'end_user'; // same here
    } else {
      return res.sendError?.('Unauthorized access', 403)
        ?? res.status(403).json({ message: 'Unauthorized access' });
    }

    const result = await getAllDeliveryAddresses({
      page: parseInt(page),
      limit: parseInt(limit),
      filters,
      order: order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      user, // pass the resolved user object
    });

    return res.sendSuccess(result, 'Delivery addresses retrieved successfully');
  } catch (error) {
    console.error('getAll error:', error);
    return res.sendError('Failed to retrieve delivery addresses', 400, error);
  }
};


// PUT
export const update = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.body?.user_id ?? req.user?.id;

    if (!userId) {
      return res.sendError('Unauthorized: user ID not found', 401);
    }

    const updatePayload = {
      ...req.body,
      updatedBy: req.user?.id ?? req.userAgent?.id ?? req.admin?.id,
    };

    const updated = await updateDeliveryAddress(addressId, updatePayload);

    if (!updated) {
      return res.sendError('Address not found or inactive', 404);
    }

    return res.sendSuccess(updated, 'Address updated successfully');
  } catch (error) {
    return res.sendError('Failed to update address', 400, error);
  }
};

// Soft delete
export const remove = async (req, res) => {
  try {
    const deleted = await softDeleteDeliveryAddress(req.params.id);

    if (!deleted) {
      return res.sendError('Address already deleted or not found', 404);
    }

    return res.sendSuccess(null, 'Address soft deleted');
  } catch (error) {
    return res.sendError('Failed to delete address', 400, error);
  }
};

// Restore
export const restore = async (req, res) => {
  try {
    const restored = await restoreDeliveryAddress(req.params.id);

    if (!restored) {
      return res.sendError('Address not found or already active', 404);
    }

    return res.sendSuccess(null, 'Address restored');
  } catch (error) {
    return res.sendError('Failed to restore address', 400, error);
  }
};
