import {
  createPartner,
  getPartners,
  getPartnerTypes,
  getPartnerById,
  updatePartner,
  deletePartnerById,
  deletePartners,
  restorePartnerById,
  restorePartners
} from '../service/partner.service.js';
import exportToPdf from '../../utils/exportPdf.js';
const partnerController = {
  async create(req, res) {
    try {
      const payload = {
        ...req.body,
        createdBy: req.admin?.id,
        updatedBy: req.admin?.id
      };
      const newPartner = await createPartner(payload);
      return res.sendSuccess(newPartner, 'Partner created successfully');
    } catch (err) {
      //  If error message is known, return 400
      if (err.message === 'Partner with this phone or email already exists') {
        return res.sendError(err.message, 400); // Bad Request
      }

      // ✅For all other errors, return 500
      return res.sendError('Failed to create partner', 500, err);
    }
  },

  //getall
  async list(req, res) {
    try {
      const {
        includeInactive,
        is_active,
        partner_type,
        search,
        page,
        limit,
        orderBy,
        order,
        is_master,
        startDate, endDate,
        export: exportType 
      } = req.query;

      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const orderDir = ['asc', 'desc'].includes((order || '').toLowerCase())
        ? order.toLowerCase()
        : 'asc';

      const { rows, count } = await getPartners({
        includeInactive: includeInactive === 'true',
        is_active: is_active === 'true'
          ? true
          : is_active === 'false'
            ? false
            : undefined,
        partner_type,
        search,
        page: pageNum,
        limit: limitNum,
        orderBy: orderBy || 'createdAt',
        order: orderDir,
        isMaster: is_master === 'true',
        startDate,
        endDate,
        currentUser: req.user || null,
        userAgent: req.userAgent || null,
        isAdmin: Boolean(req.admin),
      });

      // //  Handle PDF export
      // if (exportType === 'pdf') {
      //   const pdfData = {
      //     date: new Date().toLocaleDateString(),
      //     totalCount: count,
      //     partners: rows.map(p => ({
      //       name: p.name || "N/A",
      //       email: p.email || "N/A",
      //       phone: p.phone || "N/A",
      //       partner_type: p.partner_type || "N/A",
      //       is_active: p.is_active ? 'Active' : 'Inactive',
      //       address1: p.address1 || '',
      //       address2: p.address2 || '',
      //       district: p.district || '',
      //       pincode: p.pincode || '',
      //       state: p.state || '',
      //       country: p.country || '',
      //       gst_in: p.gst_in || "N/A",
      //       udyog_aadhar: p.udyog_aadhar || "N/A",
      //       rc: p.rc || "N/A",
      //       // agents: p.agents?.map(agent => agent.useragent_name || agent.username || "N/A").join(', ') || "N/A",
      //     }))
      //   };

      //   const pdfBuffer = await exportToPdf("partner-report.ejs", pdfData);

      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader("Content-Disposition", `attachment; filename=partner-report-${Date.now()}.pdf`);
      //   return res.send(pdfBuffer);
      // }
      const showAgents = req.query.isagents === 'true';

      // PDF Export logic
      if (exportType === 'pdf' && is_master === 'true') {
        const date = new Date().toLocaleDateString();

        if (showAgents) {
          // Grouped PDF with Partner and Agents
          const pdfData = {
            date,
            totalCount: count,
            partners: rows.map(p => ({
              name: p.name || "N/A",
              email: p.email || "N/A",
              phone: p.phone || "N/A",
              partner_type: p.partner_type || "N/A",
              is_active: p.is_active ? 'Active' : 'Inactive',
              gst_in: p.gst_in || "N/A",
              udyog_aadhar: p.udyog_aadhar || "N/A",
              rc: p.rc || "N/A",
              agents: p.agents?.map(agent => ({
                name: agent.useragent_name || agent.username || "N/A",
                email: agent.email || "N/A",
                phone: agent.phone || "N/A",
                role: agent.role || "N/A"
              })) || [],
              address: `${p.address1 || ""}<br/>${p.address2 || ""}<br/>${p.district || ""}<br/>${p.state || ""}<br/>${p.country || ""}<br/>${p.pincode || ""}` || "N/A"
                .filter(v => v && v.trim()).join('<br/>') || "N/A"
            }))

          };

          const pdfBuffer = await exportToPdf("partner-report-with-agents.ejs", pdfData);
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `attachment; filename=partner-with-agents-${Date.now()}.pdf`);
          return res.send(pdfBuffer);

        } else {
          // Simple Partner PDF (No agents)
          const pdfData = {
            date,
            totalCount: count,
            partners: rows.map(p => ({
              name: p.name || "N/A",
              email: p.email || "N/A",
              phone: p.phone || "N/A",
              partner_type: p.partner_type || "N/A",
              is_active: p.is_active ? 'Active' : 'Inactive',
              address: `${p.address1 || ""}<br/>${p.address2 || ""}<br/>${p.district || ""} - ${p.pincode || ""}<br/>${p.state || ""}, ${p.country || ""}`,
              gst_in: p.gst_in || "N/A",
              udyog_aadhar: p.udyog_aadhar || "N/A",
              rc: p.rc || "N/A"
            }))
          };

          const pdfBuffer = await exportToPdf("partner-report-basic.ejs", pdfData);
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `attachment; filename=partner-basic-${Date.now()}.pdf`);
          return res.send(pdfBuffer);
        }
      }

      const meta = is_master === 'true'
        ? { total: count, totalPages: 1, currentPage: 1 }
        : { total: count, totalPages: Math.ceil(count / limitNum), currentPage: pageNum };

      return res.sendSuccess(
        { data: rows, meta },
        'Partners retrieved successfully'
      );
    } catch (err) {
      console.error('Error in partnerController.list():', err);
      return res.sendError('Failed to retrieve partners', 500, err);
    }
  },


  //getbyid
  async getById(req, res) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const partner = await getPartnerById(req.params.id, includeInactive);
      if (!partner) return res.sendError('Partner not found', 404);
      return res.sendSuccess(partner, 'Partner retrieved successfully');
    } catch (err) {
      return res.sendError('Failed to retrieve partner', 500, err);
    }
  },


  //Get Partner Types
async getPartnerTypes(req, res) {
  try {
    const {
      includeInactive,
      is_active,
      partner_type,
      search,
      startDate,
      endDate,
      page,
      limit,
      orderBy,
      order,
      is_master
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const orderDir = ['asc', 'desc'].includes((order || '').toLowerCase())
      ? order.toLowerCase()
      : 'asc';

    const allowedOrderFields = ['partner_type', 'partner_count'];
    const safeOrderBy = allowedOrderFields.includes(orderBy) ? orderBy : 'partner_type';

    const { rows, count } = await getPartnerTypes({
      includeInactive: includeInactive === 'true',
      is_active:
        is_active === 'true' ? true :
        is_active === 'false' ? false :
        undefined,
      partner_type,
      search,
      startDate,
      endDate,
      page: pageNum,
      limit: limitNum,
      orderBy: safeOrderBy,
      order: orderDir,
      isMaster: is_master === 'true',
      currentUser: req.user || null,
      userAgent: req.userAgent || null,
      isAdmin: req.admin === true || req.admin === 'true',
    });

    const meta = is_master === 'true'
      ? { total: count, totalPages: count > 0 ? 1 : 0, currentPage: 1 }
      : { total: count, totalPages: Math.ceil(count / limitNum), currentPage: pageNum };

    return res.sendSuccess(
      { data: rows, meta },
      'Partners grouped by type fetched successfully'
    );
  } catch (err) {
    console.error('Error in partnerController.getPartnerTypes():', err);
    return res.sendError('Failed to fetch partner types', 500, err);
  }
},




  async update(req, res) {
    try {
      const [count, rows] = await updatePartner(req.params.id, {
        ...req.body,
        updatedBy: req.admin?.id ?? req.userAgent?.id
      });
      if (count === 0) return res.sendError('Partner not found or inactive', 404);
      return res.sendSuccess(rows[0], 'Partner updated successfully');
    } catch (err) {
      return res.sendError('Failed to update partner', 500, err);
    }
  },

  async remove(req, res) {
    try {
      const force = req.query.force === 'true';
      const deletedBy = req.user?.id || null;
      const count = await deletePartnerById(req.params.id, force, deletedBy);
      if (count === 0) return res.sendError('Partner not found or already deleted', 404);
      if (force) return res.sendStatus(204);
      return res.sendSuccess({ deleted: count }, 'Partner deleted successfully');
    } catch (err) {
      return res.sendError('Failed to delete partner', 500, err);
    }
  },

  async bulkRemove(req, res) {
    try {
      const force = req.query.force === 'true';
      const deletedBy = req.user?.id || null;
      const count = await deletePartners(force, deletedBy);
      return res.sendSuccess({ deleted: count }, 'Partners deleted successfully');
    } catch (err) {
      return res.sendError('Failed to delete partners', 500, err);
    }
  },

  async restoreById(req, res) {
    try {
      const restoredBy = req.user?.id || null;
      const count = await restorePartnerById(req.params.id, restoredBy);
      if (count === 0) return res.sendError('Partner not found or not deleted', 404);
      return res.sendSuccess({ restored: count }, 'Partner restored successfully');
    } catch (err) {
      return res.sendError('Failed to restore partner', 500, err);
    }
  },

  async bulkRestore(req, res) {
    try {
      const restoredBy = req.user?.id || null;
      const count = await restorePartners(restoredBy);
      return res.sendSuccess({ restored: count }, 'Partners restored successfully');
    } catch (err) {
      return res.sendError('Failed to restore partners', 500, err);
    }
  }
};

export default partnerController;