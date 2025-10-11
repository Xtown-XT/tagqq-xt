import {
  createCheckinService,
  getAllCheckinsService,
  getCheckinByIdService,
  updateCheckinService,
  deleteCheckinService,
  restoreCheckinService,
  exportAllCheckinsPdfService,
 
} from '../service/captain_checkins.service.js';
import CaptainUser from '../models/captain_user.models.js';
import {
  createCheckinSchema,
  updateCheckinSchema,
} from '../dto/captain_checkins.dto.js';
import exportToPdf from '../../utils/exportPdf.js';


// Create Check-in
export const createCheckinController = async (req, res) => {
  try {
    const captain_id = req.captain.id;

    const existingCaptain = await CaptainUser.findByPk(captain_id);
    if (!existingCaptain) {
      return res.status(404).json({ error: 'Captain user not found' });
    }

    const parsed = createCheckinSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { type, location, is_master } = parsed.data;

    const result = await createCheckinService({
      captain_id,
      type,
      location,
      is_master: is_master ?? true,
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error('Check-in creation failed:', err);
    const message = err.message?.includes('Captain already') || err.message?.includes('First action')
      ? err.message
      : 'Internal server error';
    return res.status(400).json({ error: message });
  }
};


// Update Check-in/Checkout
export const updateCheckinController = async (req, res) => {
  try {
    const { captainId } = req.params;
    const { date } = req.query;

    if (!captainId) return res.status(400).json({ error: 'captainId is required in params' });
    if (!date) return res.status(400).json({ error: 'Query parameter "date" is required' });

    const validated = updateCheckinSchema.parse(req.body);

    const result = await updateCheckinService(captainId, date, validated);

    if (!result) {
      return res.status(404).json({ error: 'No check-in found for this date' });
    }

    return res.status(200).json({
      message: 'Check-in updated',
      data: {
        updated: result.updatedCheckin,
        totalCount: result.totalCount,
        totalHours: result.totalHours,
        totalMinutes: result.totalMinutes,
      },
    });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid data', message: err.message });
  }
};


 // Get All Check-ins with filters
export const getAllCheckinsController = async (req, res) => {
  try {
    const {
      page,
      limit,
      startDate,
      endDate,
      captainName,
      is_master,
      type,
      sortBy,
      sortOrder,
      export: exportType,
    } = req.query;

    const filters = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      startDate,
      endDate,
      captainName,
      is_master: is_master === 'true' ? true : is_master === 'false' ? false : undefined,
      type,
      sortBy,
      sortOrder,
    };

    const result = await getAllCheckinsService(filters);

    if (exportType === 'pdf') {
      const data = {
        date: new Date().toLocaleDateString(),
        totalCount: result.total,
        checkins: result.data.map(checkin => ({
          id: checkin.id,
          type: checkin.type || "N/A",
          time: checkin.created_at.toLocaleString(),
          captainName: checkin.captain?.name || "N/A",
          captainPhone: checkin.captain?.phone || "N/A",
          is_master: checkin.is_master ? "Yes" : "No"
        }))
      };

      const pdfBuffer = await exportToPdf("checkin-report.ejs", data);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=checkins-${Date.now()}.pdf`);
      return res.send(pdfBuffer);
    }

    return res.status(200).json({ message: 'Check-ins fetched', ...result });
  } catch (err) {
    console.error("Checkin fetch error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Get Check-in by ID and Date
export const getCheckinByIdController = async (req, res) => {
  try {
    const { captainId } = req.params;
    const { date } = req.query;

    if (!captainId) {
      return res.status(400).json({ error: 'captainId is required in params' });
    }

    if (!date) {
      return res.status(400).json({ error: 'date is required in query' });
    }

    const result = await getCheckinByIdService(captainId, date);

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

// Soft Delete
export const deleteCheckinController = async (req, res) => {
  try {
    const checkinId = req.params.Id;

    if (!checkinId) {
      return res.status(400).json({ error: 'checkinId is required in params' });
    }

    const deleted = await deleteCheckinService(checkinId);

    if (!deleted) {
      return res.status(404).json({ error: 'Checkin not found' });
    }

    return res.status(200).json({ message: 'Checkin deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCheckinController:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// Restore Check-in
export const restoreCheckinController =async (req, res) => {
  try {
    const checkinId = req.params.Id;
    const isAdmin = !!req.admin;
    const captainId = req.CaptainUser?.id || req.admin?.id;

    if (!checkinId) {
      return res.status(400).json({ error: 'checkinId is required in params' });
    }

    const restored = await restoreCheckinService(checkinId, captainId, isAdmin);

    if (!restored) {
      return res.status(404).json({ error: 'Check-in not found or not deleted' });
    }

    return res.status(200).json({ message: 'Check-in restored successfully' });
  } catch (err) {
    console.error('Restore error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Export All Check-ins (Admin PDF Export) 
export const exportAllCheckinsPdfController = async (req, res) => {
  try {
    const { type, date, startDate, endDate, captainName, sortBy, sortOrder, export: exportType } = req.query;


    if (type === 'daily' && !date) {
      return res.status(400).json({ error: 'Date is required for daily reports' });
    }
    if ((type === 'weekly' || type === 'monthly') && (!startDate || !endDate)) {
      return res.status(400).json({ error: `Start date and end date are required for ${type} reports` });
    }

    const user = req.admin || req.captain; 
    if (!user) return res.status(403).json({ error: 'Unauthorized user' });
    if (exportType !== 'pdf') return res.status(400).json({ error: 'Only PDF export is supported' });

    const pdfBuffer = await exportAllCheckinsPdfService(
      { type, date, startDate, endDate, captainName, sortBy, sortOrder },
      user
    );

    res
      .setHeader('Content-Type', 'application/pdf')
      .setHeader('Content-Disposition', 'attachment; filename="captain-checkins-report.pdf"')
      .send(pdfBuffer);
  } catch (error) {
    console.error('PDF Export Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to export report' });
  }
};