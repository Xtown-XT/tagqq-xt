import * as publicUrlService from '../service/public_url.service.js';
import Publicurl from '../models/public_url.model.js';
import AgentUser from '../../user_agent/models/user_agent.model.js';
import exportToPdf from '../../utils/exportPdf.js';

const publicUrlController = {
  async create(req, res) {
    try {
      const userId = req.body?.user_id ?? req.user?.id;

      if (!userId) {
        return res.sendError('Unauthorized: user ID not found', 401);
      }

      const payload = {
        ...req.body,
        user_id: userId,
        created_by: req.user?.id ?? req.userAgent?.id ?? req.admin?.id,
        updated_by: req.user?.id ?? req.userAgent?.id ?? req.admin?.id,
        status: 'Not paid',
      };

      const newPublicUrl = await publicUrlService.createPublicUrl(payload);
      return res.sendSuccess(newPublicUrl, 'Public URL created successfully', 201);
    } catch (err) {
      return res.sendError('Failed to create public URL', 400, err);
    }
  },

  async createEmergencyUser(req, res) {
    try {
      const { id: publicUrlId } = req.params;
      const userData = req.body;
      const agentID = req.body?.referral_id ?? req.userAgent?.id;

      const result = await publicUrlService.createEmergencyUser({
        publicUrlId,
        userData,
        agentID
      });

      if (!result) {
        return res.sendError('Public URL not found', 404);
      }

      return res.sendSuccess(result, 'Emergency user created successfully', 201);
    } catch (err) {
      const knownMessages = [
        'This QR code is already assigned to a user.',
        'A user with this email already exists.'
      ];

      const message = knownMessages.includes(err.message)
        ? err.message
        : 'Failed to create emergency user';

      return res.sendError(message, 400, err);
    }
  },

  //get all
  async list(req, res) {
    try {
      const {
        includeInactive,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        orderBy = 'createdAt',
        order = 'asc',
        export: exportType,
        isMaster
      } = req.query;

      const orderDir = ['asc', 'desc'].includes(order.toLowerCase())
        ? order.toLowerCase()
        : 'asc';

      const filters = {
        includeInactive,
        status,
        startDate,
        endDate,
        page: Number(page),
        limit: Number(limit),
        orderBy,
        order: orderDir,
        isMaster,
      };

      // Role-based filter logic
      if (req.user) {
        filters.user_id = req.user.id;
      } else if (req.userAgent) {
        const agent = await AgentUser.findByPk(req.userAgent.id, {
          attributes: ['partner_id']
        });

        if (!agent) {
          return res.sendError('Agent user not found', 404);
        }

        filters.userAgentPartnerId = agent.partner_id;
      }

      const result = await publicUrlService.getPublicUrls(filters);
      const totalcount = result.count;
      const totalPages = Math.ceil(totalcount / filters.limit);

      if (exportType === 'pdf') {
        const templatePath = 'publicUrls.ejs';

        const data = {
          date: new Date().toLocaleDateString(),
          totalCount: totalcount,
          urls: result.rows.map((item, index) => ({
            index: index + 1,
            id: item.id || 'N/A',
            status: item.status || 'N/A',
            user_id: item.user_id || 'N/A',
            order_id: item.order_id || 'N/A',
            username: item.user?.username || 'N/A',
            email: item.user?.email || 'N/A',
            phone: item.user?.phone || 'N/A',
          })),
        };

        const pdfBuffer = await exportToPdf(templatePath, data);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=public-urls-${Date.now()}.pdf`
        );

        return res.send(pdfBuffer);
      }

      // Default JSON response
      return res.sendSuccess(
        {
          data: result.rows || [],
          meta: {
            totalcount,
            totalPages,
            currentPage: Number(page),
          },
        },
        'Public URLs retrieved successfully'
      );
    } catch (err) {
      console.error('Public URL list error:', err);
      return res.sendError('Failed to retrieve public URLs', 400, err);
    }
  },



  async getById(req, res) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const publicUrl = await publicUrlService.getPublicUrlById(req.params.id, includeInactive);

      if (!publicUrl) {
        return res.sendError('Public URL not found', 404);
      }

      return res.sendSuccess(publicUrl, 'Public URL retrieved successfully');
    } catch (err) {
      return res.sendError('Failed to retrieve public URL', 400, err);
    }
  },

  async getByIdEm(req, res) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const publicUrl = await publicUrlService.getPublicUrlByIdEm(req.params.id, includeInactive);

      if (!publicUrl) {
        return res.sendError('Public URL not found', 404);
      }

      return res.sendSuccess(publicUrl, 'Public URL retrieved successfully');
    } catch (err) {
      console.error('GetByIdEm Error:', err);
      return res.sendError('Failed to retrieve public URL', 400, err.message);
    }
  },

  //update
  async update(req, res) {
    try {
      const updatedBy = req.user?.id ?? req.userAgent?.id ?? req.admin?.id;
      const currentUserId = updatedBy;

      const updatePayload = {
        ...req.body,
        updated_by: updatedBy,
      };

      const [count, updatedRecord] = await publicUrlService.updatePublicUrl(
        req.params.id,
        updatePayload,
        currentUserId
      );

      if (count === 0 || !updatedRecord) {
        return res.sendError('Public URL not found or inactive', 404);
      }

      return res.sendSuccess(updatedRecord, 'Public URL updated successfully');
    } catch (err) {
      console.error('Update error:', err);

      if (err.message === 'Already assigned to a user for this QR code.') {
        return res.sendError(err.message, 403); // Forbidden
      }

      return res.sendError('Failed to update public URL', 400, err.message);
    }
  },

  //UPDATE URL
  async updateUrl(req, res) {
    try {
      const updatedBy = req.user?.id ?? req.userAgent?.id ?? req.admin?.id;
      const { status } = req.body;
      const { id } = req.params;

      const validStatuses = ['Paid', 'Expried', 'Not Paid', 'Active', 'Inactive'];
      if (!validStatuses.includes(status)) {
        return res.sendError(`Invalid status. Allowed: ${validStatuses.join(', ')}`, 400);
      }

      const updatePayload = {
        status,
        updated_by: updatedBy,
      };

      const [count, rows] = await publicUrlService.updatePublicUrlbyuserid(id, updatePayload);

      if (count === 0 || !rows || rows.length === 0) {
        return res.sendError('No active record found for the provided ID', 404);
      }

      return res.sendSuccess(rows, 'Status updated successfully');
    } catch (error) {
      console.error('Update Error:', error);
      return res.sendError('Internal Server Error', 500, error.message);
    }
  },

  // In your controller
  async updateUrlforCaptain(req, res) {
    try {
      const updatedBy = req.user?.id ?? req.userAgent?.id ?? req.admin?.id;
      const captainId = req.captain?.id ?? req.body?.captain_id;
      const { id } = req.params;

      // 1) Fetch the record
      const publicUrl = await publicUrlService.getPublicUrlById(id);
      if (!publicUrl || !publicUrl.is_active) {
        return res.sendError('No active record found for the provided ID', 404);
      }

      // 2) Check if already assigned
      if (publicUrl.captain_id) {
        return res.sendError(
          `This QR code is already assigned to captain ${publicUrl.captain_id}`,
          400
        );
      }

      // 3) Perform update
      const updatePayload = { captain_id: captainId, updated_by: updatedBy };
      const [count, rows] = await publicUrlService.updatePublicUrlbyCaptianid(id, updatePayload);

      if (count === 0) {
        return res.sendError('Failed to update record', 500);
      }

      return res.sendSuccess(rows, 'Status updated successfully');
    } catch (error) {
      console.error('Update Error:', error);
      return res.sendError('Internal Server Error', 500, error.message);
    }
  },




  async remove(req, res) {
    try {
      const force = req.query.force === 'true';
      const deletedBy = req.user?.id || null;

      const count = await publicUrlService.deletePublicUrlById(req.params.id, force, deletedBy);

      if (count === 0) {
        return res.sendError('Public URL not found or already deleted', 404);
      }

      if (force) {
        return res.sendSuccess(null, 'Public URL permanently deleted', 204);
      }

      return res.sendSuccess({ deleted: count }, 'Public URL soft deleted successfully');
    } catch (err) {
      return res.sendError('Failed to delete public URL', 400, err);
    }
  },

  async bulkRemove(req, res) {
    try {
      const force = req.query.force === 'true';
      const deletedBy = req.user?.id || null;

      const count = await publicUrlService.deletePublicUrls(force, deletedBy);

      return res.sendSuccess({ deleted: count }, 'Public URLs deleted successfully');
    } catch (err) {
      return res.sendError('Failed to delete public URLs', 400, err);
    }
  },

  async restoreById(req, res) {
    try {
      const restoredBy = req.user?.id || null;

      const count = await publicUrlService.restorePublicUrlById(req.params.id, restoredBy);

      if (count === 0) {
        return res.sendError('Public URL not found or not deleted', 404);
      }

      return res.sendSuccess({ restored: count }, 'Public URL restored successfully');
    } catch (err) {
      return res.sendError('Failed to restore public URL', 400, err);
    }
  },

  async bulkRestore(req, res) {
    try {
      const restoredBy = req.user?.id || null;

      const count = await publicUrlService.restorePublicUrls(restoredBy);

      return res.sendSuccess({ restored: count }, 'Public URLs restored successfully');
    } catch (err) {
      return res.sendError('Failed to restore public URLs', 400, err);
    }
  },
};

export default publicUrlController;
