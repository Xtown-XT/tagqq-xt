import State from '../models/address.state.models.js';
import { Op } from 'sequelize';

// POST - Create State
export const createState = async (data) => {
  return await State.create(data);
};

// GET by ID
export const getStateById = async (id) => {
  return await State.findOne({
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
export const getAllStates = async ({ filters = {}, order = 'DESC' }) => {
  // Default country_id to 76 if not passed
  const countryId = filters.country_id || 76;

  const whereClause = {
    ...(filters.name && { name: { [Op.like]: `%${filters.name}%` } }),
    country_id: countryId,
    ...(filters.is_active === 'true' && { is_active: true }),
    ...(filters.is_active === 'false' && { is_active: false })
  };

  const result = await State.findAll({
    where: whereClause,
    order: [['created_at', order]],
    attributes: {
      exclude: ['created_at', 'updated_at', 'created_by', 'updated_by']
    }
  });

  return {
    total: result.length,
    pages: 1,
    currentPage: 1,
    records: result
  };
};


// PUT - Update
export const updateState = async (id, data) => {
  const state = await State.findByPk(id);
  if (!state || !state.is_active) return null;

  await state.update(data);
  return state;
};

// Soft Delete
export const softDeleteState = async (id, deletedBy = null) => {
  const state = await State.findByPk(id);
  if (!state || !state.is_active) return null;

  await state.update({
    is_active: false,
    deleted_at: new Date(),
    deleted_by: deletedBy
  });

  return state;
};

// Restore
export const restoreState = async (id) => {
  const state = await State.findByPk(id);
  if (!state || state.is_active) return null;

  await state.update({
    is_active: true,
    deleted_at: null,
    deleted_by: null
  });

  return state;
};
