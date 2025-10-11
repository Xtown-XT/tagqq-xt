import BloodGroup from '../models/bloodgroup.models.js';
import { Op } from 'sequelize';

// POST - Create Blood Group
export const createBloodGroup = async (data) => {
  return await BloodGroup.create(data);
};

// GET by ID
export const getBloodGroupById = async (id) => {
  return await BloodGroup.findOne({
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
export const getAllBloodGroups = async ({ page, limit, filters = {}, order = 'DESC' }) => {
  const offset = (page - 1) * limit;

  const whereClause = {
    is_active: true,
    ...(filters.name && { name: { [Op.like]: `%${filters.name}%` } })
  };

  const result = await BloodGroup.findAndCountAll({
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
export const updateBloodGroup = async (id, data) => {
  const group = await BloodGroup.findByPk(id);
  if (!group || !group.is_active) return null;

  await group.update(data);
  return group;
};

// Soft Delete (manual is_active and deleted_at/by)
export const softDeleteBloodGroup = async (id, deletedBy = null) => {
  const group = await BloodGroup.findByPk(id);
  if (!group || !group.is_active) return null;

  await group.update({
    is_active: false,
    deleted_at: new Date(),
    deleted_by: deletedBy
  });

  return group;
};

// Restore 
export const restoreBloodGroup = async (id) => {
  const group = await BloodGroup.findByPk(id);
  if (!group || group.is_active) return null;

  await group.update({
    is_active: true,
    deleted_at: null,
    deleted_by: null
  });

  return group;
};