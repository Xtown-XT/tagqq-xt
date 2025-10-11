import {
  createCustomerDoc,
  getCustomerDocById,
  getGroupedUserDocCounts,
  updateCustomerDoc,
  softDeleteCustomerDoc,
  getAllCustomerDocs,
  restoreCustomerDoc
} from '../service/customer_doc.service.js';
import exportToPdf from "../../utils/exportPdf.js";
import Publicurl from '../models/public_url.model.js';
import CustomerDoc from '../models/customer_doc.models.js';
import { Op } from 'sequelize';

// POST
export const create = async (req, res) => {
  try {
    const fileFront = req.files?.file_front?.[0];
    const fileBack = req.files?.file_back?.[0];

    if (!fileFront) {
      return res.sendError('Front side file is required', 400);
    }

    const userId = req.body?.user_id ?? req.user?.id;
    if (!userId) {
      return res.sendError('Unauthorized: user ID not found', 401);
    }

    // Count existing customer docs
    const docCount = await CustomerDoc.count({
      where: { user_id: userId },
    });

    // If second or later document, validate QR
    if (docCount > 0) {
      const userQr = await Publicurl.findOne({
        where: { user_id: userId },
      });

      if (!userQr) {
        return res.sendError('You do not have a QR. Please generate or activate your QR to upload more documents.', 403);
      }

      if (!['Paid', 'Active'].includes(userQr.status) || !userQr.is_active) {
        return res.sendError('Your QR is inactive or unpaid. Please activate your QR to upload more documents.', 403);
      }
    }

    // Prepare document payload
    const payload = {
      ...req.body,
      user_id: userId,
      createdBy: req.user?.id ?? req.userAgent?.id ?? req.admin?.id,
      doc_blob: fileFront.buffer.toString('base64'),
      doc_blob_back: fileBack?.buffer?.toString('base64') ?? null,
      mime_type: fileFront.mimetype,
      file_size: fileFront.size / (1024 * 1024), // MB
      is_active: true,
    };

    const doc = await createCustomerDoc(payload);
    return res.sendSuccess(doc, 'Document created successfully', 201);

  } catch (error) {
    console.error("Document Creation Error:", error);

    return res.sendError('Failed to create document', 400, {
      message: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// GET by ID
export const getById = async (req, res) => {
  try {
    const doc = await getCustomerDocById(req.params.id);
    if (!doc) {
      return res.sendError('Document not found', 404);
    }
    return res.sendSuccess(doc, 'Document retrieved successfully');
  } catch (error) {
    return res.sendError('Failed to retrieve document', 400, error);
  }
};

// GET all
// src/controller/customer_doc.controller.js
export const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      order = 'DESC',
      user_id,
      doc_name,
      doc_type,
      mime_type,
      file_size,
      is_active,
      is_master,
      startDate,
      endDate,
      export: exportType
    } = req.query;

    // build filter object
    const filters = { user_id, doc_name, doc_type, mime_type, file_size };
    if (is_active === 'true' || is_active === 'false') {
      filters.is_active = is_active;
    }

    const isMaster = is_master === 'true';
    const isAdmin  = Boolean(req.admin);

    const result = await getAllCustomerDocs({
      page:        parseInt(page, 10),
      limit:       parseInt(limit, 10),
      filters,
      startDate,
      endDate,
      order:       order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      isMaster,
      currentUser: isAdmin ? null : req.user || null
    });

    // If PDF export requested
    if (exportType === 'pdf') {
      const templatePath = 'customer-doc-report.ejs';
      const data = {
        date:       new Date().toLocaleDateString(),
        totalCount: result.total,
        docs:       result.docs.map(doc => ({
          doc_name:     doc.doc_name     || 'N/A',
          doc_type:     doc.doc_type     || 'N/A',
          mime_type:    doc.mime_type    || 'N/A',
          file_size:    doc.file_size    || 0,
          username:     doc.user?.username || 'N/A',
          preview_front: `data:${doc.mime_type};base64,${doc.doc_blob}`,
          preview_back: doc.doc_blob_back
            ? `data:${doc.mime_type};base64,${doc.doc_blob_back}`
            : null
        }))
      };

      const pdfBuffer = await exportToPdf(templatePath, data);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=customer-docs-${Date.now()}.pdf`
      );
      return res.send(pdfBuffer);
    }

    return res.sendSuccess(result, 'Documents retrieved successfully');
  } catch (error) {
    console.error('Failed to retrieve documents:', error);
    return res.sendError('Failed to retrieve documents', 400, error);
  }
};

// Get count
export const getCounts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const data = await getGroupedUserDocCounts({ page, limit });

    return res.status(200).json({
      success: true,
      message: 'User document counts fetched successfully',
      data,
    });
  } catch (error) {
    console.error('Error in getCounts controller:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch document counts',
      error: error?.message || 'Internal Server Error',
    });
  }
};


// PUT
export const update = async (req, res) => {
  try {
    const docId = req.params.id;
    const file = req.file;
    const userId = req.body?.user_id ?? req.user?.id;

    if (!userId) {
      return res.sendError('Unauthorized: user ID not found', 401);
    }

    const updatePayload = {
      updatedBy: req.user?.id ?? req.userAgent?.id ?? req.admin?.id,
    };

    const { doc_type, doc_name, remarks } = req.body;
    if (doc_type) updatePayload.doc_type = doc_type;
    if (doc_name) updatePayload.doc_name = doc_name;
    if (remarks) updatePayload.remarks = remarks;

    if (file) {
      updatePayload.doc_blob = file.buffer.toString('base64');
      updatePayload.mime_type = file.mimetype;
      updatePayload.file_size = file.size / (1024 * 1024); // MB
    }

    const updated = await updateCustomerDoc(docId, updatePayload);

    if (!updated) {
      return res.sendError('Document not found or inactive', 404);
    }

    return res.sendSuccess({
      id: updated.id,
      user_id: updated.user_id,
      doc_type: updated.doc_type,
      doc_name: updated.doc_name,
      doc_blob: updated.doc_blob,
      mime_type: updated.mime_type,
      file_size: updated.file_size,
      remarks: updated.remarks,
      is_active: updated.is_active
    }, 'Document updated successfully');
  } catch (error) {
    console.error(error);
    return res.sendError('Failed to update document', 400, error);
  }
};

// Soft delete
export const remove = async (req, res) => {
  try {
    const deleted = await softDeleteCustomerDoc(req.params.id);
    if (!deleted) {
      return res.sendError('Document already deleted or not found', 404);
    }
    return res.sendSuccess(null, 'Document soft deleted');
  } catch (error) {
    return res.sendError('Failed to delete document', 400, error);
  }
};

// Restore
export const restore = async (req, res) => {
  try {
    const restored = await restoreCustomerDoc(req.params.id);
    if (!restored) {
      return res.sendError('Document not found or already active', 404);
    }
    return res.sendSuccess(null, 'Document restored');
  } catch (error) {
    return res.sendError('Failed to restore document', 400, error);
  }
};
