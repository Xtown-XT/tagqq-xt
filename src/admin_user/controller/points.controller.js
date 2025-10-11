// src/controllers/points.controller.js
import * as pointsService from '../service/points.service.js';

export const createPointsController = async (req, res, next) => {
  try {
    const { referral_id, points, remarks, createdBy } = req.body;
    const data = await pointsService.createPoints({ referral_id, points, remarks, createdBy });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getAllPointsController = async (req, res, next) => {
  try {
    // Parse & coerce query params
    const includeInactive = req.query.includeInactive === 'true';
    const page           = parseInt(req.query.page, 10) || 1;
    const limit          = parseInt(req.query.limit, 10) || 10;
    const search         = req.query.search || '';
    
    // Only allow these three types, otherwise null
    const allowedTypes = ['useragent', 'adminuser', 'enduser'];
    const filterType   = allowedTypes.includes(req.query.filterType)
                         ? req.query.filterType
                         : null;
    
    // Sorting fields
    const orderBy = req.query.orderBy || 'points';
    const order   = req.query.order && req.query.order.toLowerCase() === 'asc'
                    ? 'asc'
                    : 'desc';
    
    // Date filters
    const startDate = req.query.startDate || null;
    const endDate   = req.query.endDate   || null;

    // Build options object
    const options = {
      includeInactive,
      page,
      limit,
      search,
      filterType,
      orderBy,
      order,
      startDate,
      endDate,
    };

    // Call service
    const { data, total } = await pointsService.getAllPoints(options);

    // Respond
    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      data,
    });
  } catch (err) {
    next(err);
  }
};


export const getPointsByUserController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const includeInactive = req.query.includeInactive === 'true';
    const data = await pointsService.getPointsByUserId(userId, { includeInactive });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
};

export const getPointsByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const includeInactive = req.query.includeInactive === 'true';
    const data = await pointsService.getPointsById(id, { includeInactive });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updatePointsController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { updatedBy, ...updates } = req.body;
    const data = await pointsService.updatePointsById(id, updates, updatedBy);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const softDeletePointsController = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pointsService.softDeletePointsById(id);
    res.status(200).json({ success: true, message: 'Soft-deleted' });
  } catch (err) {
    next(err);
  }
};

export const restorePointsController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await pointsService.restorePointsById(id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const hardDeletePointsController = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pointsService.hardDeletePointsById(id);
    res.status(200).json({ success: true, message: 'Permanently deleted' });
  } catch (err) {
    next(err);
  }
};

export async function getAnalytics(req, res) {
  try {
    const result = await pointsService.getPointAnalytics();

    return res.sendSuccess(result, 'Points analytics retrieved successfully');
  } catch (err) {
    console.error('Points analytics error:', err);
    return res.sendError('Failed to retrieve points analytics', 500, err);
  }
}
