// src/blooddonor/controller/blood_donor.controller.js
import fs from 'fs';
import xlsx from 'xlsx';
import exportToPdf from '../../utils/exportPdf.js';
import State from '../../endUser/models/address.state.models.js';
import Country from '../../endUser/models/address.country.models.js';
import {
  createBloodDonor,
  getBloodDonorById,
  getAllBloodDonors,
  updateBloodDonor,
  softDeleteBloodDonor,
  restoreBloodDonor,
  bulkCreateBloodDonors,
  bulkCreateBloodDonorsexcell

} from '../service/blooddonor.service.js';

// Create
export const create = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      created_by: req.user?.id ?? req.userAgent?.id ?? req.admin?.id,
      is_active: true
    };
    const donor = await createBloodDonor(payload);
    return res.sendSuccess(donor, 'Blood donor created successfully', 201);
  } catch (error) {
    return res.sendError('Failed to create blood donor', 400, error);
  }
};

// Get by ID
export const getById = async (req, res) => {
  try {
    const donor = await getBloodDonorById(req.params.id);
    if (!donor) {
      return res.sendError('Blood donor not found', 404);
    }
    return res.sendSuccess(donor, 'Blood donor retrieved successfully');
  } catch (error) {
    return res.sendError('Failed to retrieve blood donor', 400, error);
  }
};

// Get all
export const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      order = 'DESC',
      name,
      mobile_no,
      blood_group,
      district,
      is_active,
      export: exportType,
      is_master = 'false'
    } = req.query;
    const isMaster = is_master === 'true';
    const filters = { name, mobile_no, blood_group, district };
    console.log("filters Hiiiiiiiiiiiii", filters)

    if (is_active === 'true' || is_active === 'false') {
      filters.is_active = is_active;
    }

    const result = await getAllBloodDonors({
      page: isMaster ? undefined : parseInt(page),
      limit: isMaster ? undefined : parseInt(limit),
      filters,
      order: order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      is_master: isMaster
    });
    //  PDF Export
    if (exportType === 'pdf') {
      const templatePath = 'blooddonor-report.ejs';

      const data = {
        date: new Date().toLocaleDateString(),
        totalCount: result.total,
        donors: result.records.map(donor => ({
          name: donor.name || 'N/A',
          mobile_no: donor.mobile_no || 'N/A',
          blood_group: donor.blood_group?.name || 'N/A',
          district: donor.district?.name || 'N/A',
          status: donor.is_active ? 'Active' : 'Inactive',
          is_available: donor.is_available ? 'Yes' : 'No',
          city: donor.city || 'N/A',
        }))
      };

      const pdfBuffer = await exportToPdf(templatePath, data);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=blood-donors-${Date.now()}.pdf`);
      return res.send(pdfBuffer);
    }

    return res.sendSuccess(result, 'Blood donors retrieved successfully');
  } catch (error) {
    console.error('Error retrieving blood donors:', error);
    return res.sendError('Failed to retrieve blood donors', 400, error);
  }
};


// Update
export const update = async (req, res) => {
  try {
    console.log('File received:', req.file);
    if (!req.file) {
      return res.sendError('No file uploaded', 400);
    }

    const donorId = req.params.id;
    const updatePayload = {
      ...req.body,
      updated_by: req.user?.id ?? req.userAgent?.id ?? req.admin?.id
    };
    const updated = await updateBloodDonor(donorId, updatePayload);
    if (!updated) {
      return res.sendError('Blood donor not found or inactive', 404);
    }
    return res.sendSuccess(updated, 'Blood donor updated successfully');
  } catch (error) {
    console.error('[Excel Upload Error]', error)
    return res.sendError('Failed to update blood donor', 400, error);
  }
};

// Soft delete
export const remove = async (req, res) => {
  try {
    const deleted = await softDeleteBloodDonor(req.params.id);
    if (!deleted) {
      return res.sendError('Blood donor already deleted or not found', 404);
    }
    return res.sendSuccess(null, 'Blood donor soft deleted');
  } catch (error) {
    return res.sendError('Failed to delete blood donor', 400, error);
  }
};

// Restore
export const restore = async (req, res) => {
  try {
    const restored = await restoreBloodDonor(req.params.id);
    if (!restored) {
      return res.sendError('Blood donor not found or already active', 404);
    }
    return res.sendSuccess(null, 'Blood donor restored');
  } catch (error) {
    return res.sendError('Failed to restore blood donor', 400, error);
  }
};

// bulkupload
export const bulkUploadBloodDonors = async (req, res) => {
  try {
    const created_by = req.user?.id ?? req.userAgent?.id ?? req.admin?.id;
    const donors = req.body; // Expecting array of donor objects

    if (!Array.isArray(donors)) {
      return res.sendError('Payload must be an array of donors', 400);
    }

    const result = await bulkCreateBloodDonors(donors, created_by);
    return res.sendSuccess(result, 'Bulk donors uploaded successfully');
  } catch (error) {
    return res.sendError('Bulk upload failed', 500, error);
  }
};

// Excel Bulk Upload Controller
export const bulkUploadBloodDonorsExcel = async (req, res) => {
  try {
    const filePath = req.file.path;

    // Read Excel file
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const donorData = xlsx.utils.sheet_to_json(sheet);

    if (!donorData.length) {
      fs.unlinkSync(filePath);
      return res.sendError('Excel file is empty', 400);
    }

    const created_by = req.user?.id ?? req.userAgent?.id ?? req.admin?.id;

    const result = await bulkCreateBloodDonorsexcell(donorData, created_by);

    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.warn('Failed to delete uploaded file:', e.message);
    }
    return res.sendSuccess(result, 'Bulk donors uploaded via Excel successfully');
  } catch (error) {
    console.error('[Excel Upload Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process Excel file',
      error: error.message,
      stack: error.stack
    });
  }
};