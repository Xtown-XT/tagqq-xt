import CaptainUser from '../models/captain_user.models.js';
import {
  createCaptainUser,
  loginCaptainUser,
  updateCaptainUserById,
  getCaptainUsers,
  getCaptainUserById,
  sendOtpToken,
  resetPasswordStateless,
  changeCaptainPassword,
  logoutCaptainUser,
  softDeleteCaptainUser,
  restoreCaptainUser,
  getCaptainUserMe,
  captainAlreadyExists,
  refreshCaptainAccessToken
} from '../service/captain_user.service.js';
import exportToPdf from "../../utils/exportPdf.js";



// Register
export const registerCaptainUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    console.log('Req body:', req.body)

    const user = await createCaptainUser({ name, email, phone, password });

    return res.sendSuccess({
      id: user.id,
      emp_id: user.emp_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      is_active: user.is_active,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      captain: user.captain
    }, 'Captain user registered successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.sendError('Email or phone number already exists', 409);
    }

    console.error('Register CaptainUser Error:', error);
    return res.sendError('Internal Server Error', 500);
  }
};



// Login
export const loginCaptain = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const result = await loginCaptainUser({ identifier, password });

    return res.sendSuccess({ data: result }, 'Login successful');
  } catch (error) {
    return res.sendError(error.message || 'Login failed', error.statusCode || 500);
  }
};

// Get All
export const getAllCaptainUsers = async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
      orderBy = 'desc',
      export: exportType,
      is_master = false
    } = req.query;

    // Check if requester is a captain (not admin)
    const isCaptain = !!req.captain;
    const isAdmin = !!req.admin;

    let result;

    if (isCaptain && !isAdmin) {
      // Only return the logged-in captain's data   
      const captainId = req.captain.id;
      const user = await CaptainUser.findOne({
        where: { id: captainId },
        attributes: [
          'id', 'name', 'image', 'selfi_image', 'emp_id',
          'email', 'phone', 'aadhaar', 'address', 'is_active', 'createdAt'
        ]
      });

      if (!user) {
        return res.sendError('Captain user not found', 404);
      }

      result = {
        total: 1,
        totalPages: 1,
        currentPage: 1,
        users: [user]
      };
    } else {
      // Admin request – fetch all captain users
      result = await getCaptainUsers({
        search,
        page: parseInt(page),
        limit: parseInt(limit),
        orderBy,
        is_master: is_master === 'true'
      });
    }

    // Handle export to PDF
    if (exportType === 'pdf') {
      const data = {
        date: new Date().toLocaleDateString(),
        totalCount: result.total,
        captains: result.users.map(user => ({
          emp_id: user.emp_id || "N/A",
          name: user.name || "N/A",
          email: user.email || "N/A",
          phone: user.phone || "N/A",
          image: user.image || null,
          is_active: user.is_active
        }))
      };

      const pdfBuffer = await exportToPdf("captain-user-report.ejs", data);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=captain-users-${Date.now()}.pdf`);
      return res.send(pdfBuffer);
    }

    return res.sendSuccess({ data: result }, 'Captain users retrieved successfully');
  } catch (error) {
    console.error("Error retrieving CaptainUsers:", error.message);
    res.sendError('Failed to retrieve captain users', 500);
  }
};



// Get By ID
export const getCaptainUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getCaptainUserById(id);

    return res.sendSuccess({ data: result }, "Captain user retrieved successfully");
  } catch (error) {
    console.error("Get By ID Error:", error.message);
    return res.sendError("Failed to retrieve captain user", 404);
  }
};

// /me
export const getCurrentCaptainUser = async (req, res) => {
  try {
    const id = req.captain.id;
    const user = await getCaptainUserMe(id);

    return res.sendSuccess({ user }, 'Current captain user fetched successfully');
  } catch (error) {
    console.error("Error in /me:", error.message);
    return res.sendError(error.message, 401);
  }
};

// Update

export const updateCaptainUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const captainId = req.captain?.id;   // from your captain‑auth middleware
    const adminId = req.admin?.id;     // from your admin‑auth middleware
    const updateData = { ...req.body };


    // --- Authentication check ---
    if (!captainId && !adminId) {
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized: no valid token' });
    }

    // --- Authorization rules ---
    // 1. If it’s a captain token, they can only update themselves
    if (captainId && captainId !== targetId) {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden: cannot update another captain’s profile' });
    }

    // 2. If it’s an admin token, allow through (no extra check)
    //    (i.e. adminId present ⇒ full access to all captain records)
    // ----------------------------------------------------------------

    // Handle optional file uploads
    if (req.files?.image?.[0]) {
      updateData.image = req.files.image[0].buffer.toString('base64');
    }
    if (req.files?.selfi_image?.[0]) {
      updateData.selfi_image = req.files.selfi_image[0].buffer.toString('base64');
    }

    console.log("Update Data:", updateData);

    const updated = await updateCaptainUserById(targetId, updateData);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Update CaptainUser Error:", err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error' });
  }
};

// Soft Delete
export const deactivateCaptainUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await softDeleteCaptainUser(id);

    if (result.status === "invalid_id") {
      return res.sendError("Invalid captain user ID", 400);
    }
    if (result.status === "not_found") {
      return res.sendError("Captain user not found", 404);
    }
    if (result.status === "already_inactive") {
      return res.sendError("Captain user is already inactive", 400);
    }

    return res.sendSuccess({}, "Captain user deactivated successfully");
  } catch (error) {
    console.error("Soft delete error:", error.message);
    return res.sendError("Internal Server Error", 500);
  }
};

// Reactivate
export const activateCaptainUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await restoreCaptainUser(id);

    if (result.status === "invalid_id") {
      return res.sendError("Invalid captain user ID", 400);
    }
    if (result.status === "not_found") {
      return res.sendError("Captain user not found", 404);
    }
    if (result.status === "already_active") {
      return res.sendError("Captain user is already active", 400);
    }

    return res.sendSuccess({}, "Captain user restored successfully");
  } catch (error) {
    console.error("Restore error:", error.message);
    return res.sendError("Internal Server Error", 500);
  }
};


// Forgot Password
export const forgotPasswordCaptain = async (req, res) => {
  try {
    const { email } = req.body;
    const { success, otpToken } = await sendOtpToken(email);
    return res.json({ success, otpToken });
  } catch (err) {
    console.error('Forgot Password error:', err.message);
    return res.status(400).json({ error: err.message });
  }
};

// Reset Password
export const resetPasswordCaptain = async (req, res) => {
  try {
    const { otpToken, otp, newPassword } = req.body;
    const result = await resetPasswordStateless({ otpToken, otp, newPassword });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Change Password
export const changePasswordCaptain = async (req, res) => {
  try {
    const captainId = req.captain.id;
    console.log('UUUUUUUUUUUUUUUUUUUUUUUUUUUUUcaptainId', req.captain.id)
    const { currentPassword, newPassword } = req.body;
    console.log(' currentPassword, newPassword ', currentPassword, newPassword )

    const result = await changeCaptainPassword({ captainId, currentPassword, newPassword });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Logout
export const logoutCaptain = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '').trim();
    const captainId = req.captainUser.id;

    const result = await logoutCaptainUser({ captainId, token });

    return res.sendSuccess(result, 'Captain user logged out successfully');
  } catch (error) {
    console.error('Logout Error:', error.message);
    return res.sendError(error.message || 'Logout failed', error.statusCode || 500);
  }
};

export const getCaptainAlreadyExist = async (req, res) => {
  try {
    // ← pull from req.params, not req.query
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const result = await captainAlreadyExists(phone);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('getCaptainAlreadyExist error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


//refresh token
export const handleCaptainRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.sendError('Refresh token required', 400);
    }

    const result = await refreshCaptainAccessToken(refreshToken);

    if (!result.success) {
      return res.sendError(result.message, 403);
    }

    return res.sendSuccess({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }, 'Token refreshed successfully');

  } catch (error) {
    console.error('Captain Refresh Token Error:', error.message);
    return res.sendError('Failed to refresh token', 500);
  }
};