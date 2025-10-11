import District from '../models/address.district.models.js';
import { Op } from 'sequelize';

// POST - Create District
export const createDistrict = async (data) => {
  return await District.create(data);
};

// GET by ID
export const getDistrictById = async (id) => {
  return await District.findOne({
    where: {
      id,
      is_active: true
    },
    attributes: {
      exclude: ['created_at', 'updated_at', 'created_by', 'updated_by']
    }
  });
};

// GET All with filters
export const getAllDistricts = async ({ page = 1, limit = 10, filters = {}, order = 'DESC' }) => {
  const offset = (page - 1) * limit;

  const whereClause = {
    ...(filters.name && { name: { [Op.like]: `%${filters.name}%` } }),
    ...(filters.state_id && { state_id: filters.state_id }),
    ...(filters.is_master !== 'true' && { is_active: true })  // apply is_active only if not master flag
  };

  const result = await District.findAndCountAll({
    where: whereClause,
    offset,
    limit,
    order: [['created_at', order]],
    attributes: {
      exclude: ['created_at', 'updated_at', 'created_by', 'updated_by']
    }
  });

  return {
    total: result.count,
    pages: Math.ceil(result.count / limit),
    currentPage: page,
    records: result.rows,
  };
};


// PUT - Update
export const updateDistrict = async (id, data) => {
  const district = await District.findByPk(id);
  if (!district || !district.is_active) return null;

  await district.update(data);
  return district;
};

// Soft Delete
export const softDeleteDistrict = async (id, deletedBy = null) => {
  const district = await District.findByPk(id);
  if (!district || !district.is_active) return null;

  await district.update({
    is_active: false,
    deleted_at: new Date(),
    deleted_by: deletedBy
  });

  return district;
};

// Restore
export const restoreDistrict = async (id) => {
  const district = await District.findByPk(id);
  if (!district || district.is_active) return null;

  await district.update({
    is_active: true,
    deleted_at: null,
    deleted_by: null
  });

  return district;
};
