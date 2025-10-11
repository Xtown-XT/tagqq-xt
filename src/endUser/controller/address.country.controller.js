import {
  createCountry,
  getCountryById,
  getAllCountries,
  updateCountry,
  softDeleteCountry,
  restoreCountry
} from '../service/address.country.service.js';

export const create = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      is_active: true,
      created_by: req.user?.id ?? req.userAgent?.id ?? req.admin?.id
    };

    const country = await createCountry(payload);
    return res.sendSuccess(country, 'Country created successfully', 201);
  } catch (error) {
    return res.sendError('Failed to create country', 400, error);
  }
};

export const getById = async (req, res) => {
  try {
    const country = await getCountryById(req.params.id);
    if (!country) {
      return res.sendError('Country not found', 404);
    }
    return res.sendSuccess(country, 'Country retrieved successfully');
  } catch (error) {
    return res.sendError('Failed to retrieve country', 400, error);
  }
};

export const getAll = async (req, res) => {
  try {
    const { name, is_active, order = 'DESC' } = req.query;

    const filters = { name, is_active };

    const result = await getAllCountries({
      filters,
      order: order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    });

    return res.sendSuccess(result, 'Countries retrieved successfully');
  } catch (error) {
    return res.sendError('Failed to retrieve countries', 400, error);
  }
};


export const update = async (req, res) => {
  try {
    const countryId = req.params.id;

    const updatePayload = {
      ...req.body,
      updated_by: req.user?.id ?? req.userAgent?.id ?? req.admin?.id
    };

    const updated = await updateCountry(countryId, updatePayload);

    if (!updated) {
      return res.sendError('Country not found or inactive', 404);
    }

    return res.sendSuccess(updated, 'Country updated successfully');
  } catch (error) {
    return res.sendError('Failed to update country', 400, error);
  }
};

export const remove = async (req, res) => {
  try {
    const deleted = await softDeleteCountry(
      req.params.id,
      req.user?.id ?? req.userAgent?.id ?? req.admin?.id
    );
    if (!deleted) {
      return res.sendError('Country already deleted or not found', 404);
    }
    return res.sendSuccess(null, 'Country soft deleted');
  } catch (error) {
    return res.sendError('Failed to delete country', 400, error);
  }
};

export const restore = async (req, res) => {
  try {
    const restored = await restoreCountry(req.params.id);
    if (!restored) {
      return res.sendError('Country not found or already active', 404);
    }
    return res.sendSuccess(null, 'Country restored successfully');
  } catch (error) {
    return res.sendError('Failed to restore country', 400, error);
  }
};
