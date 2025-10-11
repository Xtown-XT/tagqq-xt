import Country from '../models/address.country.models.js';
import { Op } from 'sequelize';

// Create Country
export const createCountry = async (data) => {
  return await Country.create(data);
};

// Get Country by ID
export const getCountryById = async (id) => {
  return await Country.findOne({
    where: {
      id,
      is_active: true
    },
    attributes: {
      exclude: ['created_at', 'updated_at', 'created_by', 'updated_by']
    }
  });
};


export const getAllCountries = async ({ filters = {}, order = 'DESC' }) => {
  const whereClause = {
    ...(filters.name && { name: { [Op.like]: `%${filters.name}%` } }),
    ...(filters.is_active === 'true' && { is_active: true }),
    ...(filters.is_active === 'false' && { is_active: false })
  };

  const result = await Country.findAll({
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


// Update Country
export const updateCountry = async (id, data) => {
  const country = await Country.findByPk(id);
  if (!country || !country.is_active) return null;

  await country.update(data);
  return country;
};

// Soft Delete Country
export const softDeleteCountry = async (id, deletedBy = null) => {
  const country = await Country.findByPk(id);
  if (!country || !country.is_active) return null;

  await country.update({
    is_active: false,
    deleted_at: new Date(),
    deleted_by: deletedBy
  });

  return country;
};

// Restore Country
export const restoreCountry = async (id) => {
  const country = await Country.findByPk(id);
  if (!country || country.is_active) return null;

  await country.update({
    is_active: true,
    deleted_at: null,
    deleted_by: null
  });

  return country;
};
