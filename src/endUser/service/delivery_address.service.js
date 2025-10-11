import { Op } from 'sequelize';
import DeliveryAddress from '../models/delivery_address.model.js';

// Create a new delivery address
export const createDeliveryAddress = async (data) => {
  return await DeliveryAddress.create(data);
};

// Get delivery address by ID
export const getDeliveryAddressById = async (id) => {
  return await DeliveryAddress.findOne({
    where: { id, is_active: true },
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'createdBy', 'updatedBy']
    }
  });
};

// Get all delivery addresses with pagination and filters 
export const getAllDeliveryAddresses = async ({ page, limit, filters, order, user }) => {
  const offset = (page - 1) * limit;

  const whereClause = {
    ...(filters.district && { district: { [Op.like]: `%${filters.district}%` } }),
    ...(filters.state && { state: { [Op.like]: `%${filters.state}%` } }),
    ...(filters.country && { country: { [Op.like]: `%${filters.country}%` } }),
    ...(filters.pincode && { pincode: filters.pincode }),
  };

  // Role-based filtering
  if (user.role !== 'admin') {
    whereClause.user_id = user.id; // Lock to this user
  } else if (filters.user_id) {
    whereClause.user_id = filters.user_id; // Admin can filter
  }

  if (filters.hasOwnProperty('is_active')) {
    whereClause.is_active = filters.is_active === 'true';
  }

  const result = await DeliveryAddress.findAndCountAll({
    where: whereClause,
    offset,
    limit,
    order: [['createdAt', order || 'DESC']],
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'createdBy', 'updatedBy']
    }
  });

  return {
    total: result.count,
    pages: Math.ceil(result.count / limit),
    currentPage: page,
    addresses: result.rows,
  };
};


// Update delivery address
export const updateDeliveryAddress = async (id, data) => {
  const address = await DeliveryAddress.findByPk(id);
  if (!address || !address.is_active) return null;
  await address.update(data);
  return address;
};

// Soft delete delivery address
export const softDeleteDeliveryAddress = async (id) => {
  const address = await DeliveryAddress.findByPk(id);
  if (!address || !address.is_active) return null;
  await address.update({ is_active: false });
  return address;
};

// Restore delivery address
export const restoreDeliveryAddress = async (id) => {
  const address = await DeliveryAddress.findByPk(id);
  if (!address || address.is_active) return null;
  await address.update({ is_active: true });
  return address;
};
