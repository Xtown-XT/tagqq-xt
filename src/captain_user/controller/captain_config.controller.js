// controllers/captain_config.controller.js
import {
  createCaptainConfigService,
  getCaptainConfigByIdService,
  updateCaptainConfigService,
  deleteCaptainConfigService,
  restoreCaptainConfigService,
  getCaptainConfigsService
} from '../service/captain_config.service.js';
import exportToPdf from '../../utils/exportPdf.js';

// Create a new Captain Config
export const createCaptainConfigController = async (req, res) => {
  try {
    const actorId = req.admin?.id;
    const payload = {
      ...req.body,
      created_by: actorId,
      updated_by: actorId
    };
    const config = await createCaptainConfigService(payload, actorId);
    return res.sendSuccess({ data: config }, 'Captain config created successfully');
  } catch (error) {
    console.error('Error in createCaptainConfigController:', error);
    return res.sendError(error.message, 500);
  }
};

// Retrieve a single Captain Config by ID
export const getCaptainConfigByIdController = async (req, res) => {
  try {
    const config = await getCaptainConfigByIdService(req.params.id);
    return res.sendSuccess({ data: config }, 'Captain config retrieved successfully');
  } catch (error) {
    console.error('Error in getCaptainConfigByIdController:', error);
    return res.sendError(error.message, 404);
  }
};

// Update an existing Captain Config
export const updateCaptainConfigController = async (req, res) => {
  try {
    const actorId = req.user?.id ?? req.admin?.id;
    const updated = await updateCaptainConfigService(req.params.id, req.body, actorId);
    return res.sendSuccess({ data: updated }, 'Captain config updated successfully');
  } catch (error) {
    console.error('Error in updateCaptainConfigController:', error);
    return res.sendError(error.message, 400);
  }
};

// Soft-delete a Captain Config
export const deleteCaptainConfigController = async (req, res) => {
  try {
    const actorId = req.user?.id ?? req.admin?.id;
    await deleteCaptainConfigService(req.params.id, actorId);
    return res.sendSuccess({}, 'Captain config deleted successfully');
  } catch (error) {
    console.error('Error in deleteCaptainConfigController:', error);
    return res.sendError(error.message, 404);
  }
};

// Restore a soft-deleted Captain Config
export const restoreCaptainConfigController = async (req, res) => {
  try {
    const actorId = req.user?.id ?? req.admin?.id;
    const restored = await restoreCaptainConfigService(req.params.id, actorId);
    return res.sendSuccess({ data: restored }, 'Captain config restored successfully');
  } catch (error) {
    console.error('Error in restoreCaptainConfigController:', error);
    return res.sendError(error.message, 404);
  }
};

// List/paginate Captain Configs
export const listCaptainConfigsController = async (req, res) => {
  try {
    const {
      includeDeleted = 'false',
      startDate,
      endDate,
      page = '1',
      limit = '20',
      export: exportType,
      is_master = 'false'
    } = req.query;

    // If captain is present in request, show only latest
    const isCaptain = !!req.captain;

    const result = await getCaptainConfigsService({
      includeDeleted: includeDeleted === 'true',
      startDate,
      endDate,
      page: Number(page),
      limit: Number(limit),
      onlyLatest: isCaptain, // custom flag for filtering
      skipPagination: exportType === 'pdf',
      isMaster: is_master === 'true'
    });

    // PDF export flow
    if (exportType === 'pdf') {
      const enrichedData = result.rows.map(row => {
        const plain = row.get({ plain: true });
        return {
          ...plain,
          status: plain.deletedAt ? 'Inactive' : 'Active'
        };
      });

      const pdfBuffer = await exportToPdf('captain-config-report.ejs', {
        date: new Date().toLocaleString('en-IN'),
        totalCount: result.count,
        configs: enrichedData
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="captain-config-report.pdf"');
      return res.send(pdfBuffer);
    }


    return res.sendSuccess(
      {
        data: result.rows,
        meta: {
          total: result.count,
          page: Number(page),
          limit: Number(limit)
        }
      },
      'Captain configs retrieved successfully'
    );
  } catch (error) {
    console.error('Error in listCaptainConfigsController:', error);
    return res.sendError('Failed to retrieve captain configs', 500);
  }
};


// Export as an object for routing convenience
export const captainConfigController = {
  create: createCaptainConfigController,
  getById: getCaptainConfigByIdController,
  update: updateCaptainConfigController,
  delete: deleteCaptainConfigController,
  restore: restoreCaptainConfigController,
  list: listCaptainConfigsController
};
