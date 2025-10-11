import { createUserAgent, logoutUserAgent, sendOtpToken, resetPasswordStateless, getDashboardStats, loginUser, changePassword, getUserAgents, getUserAgentById, softDeleteUserAgent, restoreUserAgent, updateUserAgentById, getUserAgentMe } from '../service/user_agent.service.js';
import exportToPdf from "../../utils/exportPdf.js";
import UserAgent from '../models/user_agent.model.js'
//signup
export const registerUserAgent = async (req, res) => {
  const { useragent_name, email, phone, role } = req.body;

  try {
    let partner_id;

    // Attempt to get partner_id from logged-in userAgent
    const agentRecord = await UserAgent.findByPk(req.userAgent?.id);
    if (agentRecord?.partner_id) {
      partner_id = agentRecord.partner_id;
    } else if (req.body?.partner_id) {
      partner_id = req.body.partner_id;
    } else {
      return res.sendError('partner_id is required', 400);
    }

    const userAgent = await createUserAgent({
      useragent_name,
      email,
      phone,
      partner_id,
      role,
    });

    return res.sendSuccess(
      {
        id: userAgent.id,
        useragent_name: userAgent.useragent_name,
        email: userAgent.email,
        phone: userAgent.phone,
        role: userAgent.role,
        partner_id: userAgent.partner_id,
        is_active: userAgent.is_active,
      },
      'User Agent registered successfully'
    );
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.sendError('Email or phone already exists', 409);
    }

    console.error('User Agent registration error:', error);
    return res.sendError('Internal Server Error', 500);
  }
};

//login 

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const result = await loginUser({ identifier, password });

    return res.sendSuccess({ data: result }, 'Login successful');
  } catch (error) {
    return res.sendError(error.message || 'Login failed', error.statusCode || 500);

  }
};

// GET all user agents
export const getAllUserAgents = async (req, res) => {
  try {
    const {
      filter,
      search,
      partner_id: partnerId,
      is_master,
      startDate, endDate,
      page,
      limit,
      orderBy,
      export: exportType
    } = req.query;

    const result = await getUserAgents({
      filter: filter || 'all',
      search: search || '',
      partnerId: partnerId || null,
      isMaster: is_master === 'true',       // string → boolean
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      orderBy: orderBy || 'desc',
      startDate, endDate,
    });
    //  If PDF export requested
    if (exportType === 'pdf') {
      const templatePath = 'useragent-report.ejs';

      const data = {
        date: new Date().toLocaleDateString(),
        totalCount: result.total,
        agents: result.userAgents.map(agent => ({
          name: agent.useragent_name || "N/A",
          email: agent.email || "N/A",
          phone: agent.phone || "N/A",
          partner_name: agent.partner?.partner_name || "N/A",
          is_active: agent.is_active
        }))
      };

      const pdfBuffer = await exportToPdf(templatePath, data);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=user-agents-${Date.now()}.pdf`
      );

      return res.send(pdfBuffer);
    }

    res.sendSuccess({ data: result }, 'User agents retrieved successfully');
  } catch (error) {
    console.error('Error retrieving user agents:', error.message);
    res.sendError('Failed to retrieve user agents', 500);
  }
};

// GET user agent by ID
export const getUserAgentByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ success: false, message: "Invalid user agent ID" });
    }

    const result = await getUserAgentById(id);

    return res.sendSuccess({ data: result }, "User agent retrieved successfully");
  } catch (error) {
    console.error("Error retrieving user agent by ID:", error.message);
    return res.sendError("Failed to retrieve user agent", 404);
  }
};

// /me
export const getCurrentUserAgent = async (req, res) => {
  try {
    const useragentId = req.userAgent.id;
    const userAgent = await getUserAgentMe(useragentId);

    return res.sendSuccess({ userAgent }, 'Current user agent fetched successfully');
  } catch (error) {
    console.error("Error in /me:", error.message);
    return res.sendError(error.message, 401);
  }
};

//put
export const updateUserAgent = async (req, res) => {
  try {
    const userAgentId = req.params.id;
    const updateData = req.body;

    const updatedAgent = await updateUserAgentById(userAgentId, updateData);

    if (!updatedAgent) {
      return res.status(404).json({ success: false, message: "UserAgent not found" });
    }

    return res.sendSuccess(
      {
        id: updatedAgent.id,
        useragent_name: updatedAgent.useragent_name,
        email: updatedAgent.email,
        phone: updatedAgent.phone,
        partner_id: updatedAgent.partner_id,
        updatedAt: updatedAgent.updatedAt,
      },
      'UserAgent updated successfully'
    );
  } catch (error) {
    console.error("Update error:", error.message);
    return res.sendError('Internal Server Error', 500);
  }
};

//soft-delete
export const deactivateUserAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await softDeleteUserAgent(id);

    if (result.status === "not_found") {
      return res.sendError('UserAgent not found', 404);
    }

    if (result.status === "already_inactive") {
      return res.sendError('UserAgent is already deactivated', 400);
    }

    return res.sendSuccess({}, 'UserAgent deactivated successfully');
  } catch (error) {
    console.error("Soft delete error:", error.message);
    return res.sendError('Internal Server Error', 500);
  }
};

//patch
export const activateUserAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await restoreUserAgent(id);

    if (result.status === "not_found") {
      return res.sendError('UserAgent not found', 404);
    }

    if (result.status === "already_active") {
      return res.sendError('UserAgent is already active', 400);
    }

    return res.sendSuccess({}, 'UserAgent restored successfully');
  } catch (error) {
    console.error("Restore error:", error.message);
    return res.sendError('Internal Server Error', 500);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const { success, otpToken } = await sendOtpToken(email);
    return res.json({ success, otpToken });
  } catch (err) {
    console.error('💥 forgotPassword error:', err.message);
    return res.status(400).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { otpToken, otp, newPassword } = req.body;
    const result = await resetPasswordStateless({ otpToken, otp, newPassword });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const changePasswordHandler = async (req, res) => {
  try {
    // assume you've already authenticated and set req.user.id
    const useragentId = req.userAgent.id;
    console.log("my id: ", useragentId)
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
    }

    const result = await changePassword({ useragentId, currentPassword, newPassword });
    res.json(result);
  } catch (err) {
    console.error('✴️ changePassword error:', err.message);
    res.status(400).json({ error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '').trim();
    const useragentId = req.userAgent.id;

    const result = await logoutUserAgent({ useragentId, token });

    return res.sendSuccess(result, 'UserAgent logged out successfully');
  } catch (error) {
    console.error('UserAgent Logout Error:', error.message);
    return res.sendError(error.message || 'Logout failed', error.statusCode || 500);
  }
};

export const dashboardHandler = async (req, res, next) => {
  try {
    const userAgentId = req.userAgent.id;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required (ISO 8601 strings).'
      });
    }

    const stats = await getDashboardStats({
      userAgentId,
      startDate,
      endDate,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });

    return res.json({ success: true, data: stats });
  } catch (error) {
    return next(error);
  }
};

