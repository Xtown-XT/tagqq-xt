// controllers/admin_user.controller.js
import {
  createAdmin,
  getAdmins,
  getAdminById,
  getAdminMe,
  loginAdmin,
  updateAdminById,
  softDeleteAdmin,
  restoreAdmin,
  refreshAdminToken,
  dashboardGlobalSearch,
  dashboard,
  sendOtpToken,
  changePassword,
  resetPasswordStateless,
  logoutAdmin,
  verifyAdminPasswordService
} from '../service/admin_user.service.js';
import exportToPdf from "../../utils/exportPdf.js";
   
// Register a new admin user
export const registerAdmin = async (req, res) => {
  const { username, email, password, phone, role } = req.body;
  try {
    const admin = await createAdmin({ username, email, password, phone, role });
    return res.sendSuccess(
      {
        id: admin.id,
        username: admin.admin_username,
        email: admin.admin_email,
        phone: admin.admin_phone,
        role: admin.role,
        token: admin.token
      },
      'Admin registered successfully',
    );
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.sendError('Username, email, or phone already exists', 409);
    }
    console.error('Registration error:', error);
    return res.sendError('Internal Server Error', 500);
  }
};

// Get all admins with optional filters, pagination, sorting
export const getAllAdmins = async (req, res) => {
  try {
    const filter           = req.query.filter || 'all';
    const page             = parseInt(req.query.page) || 1;
    const limit            = parseInt(req.query.limit) || 10;
    const orderBy          = req.query.orderBy || 'desc';
    const exportType       = req.query.export;
    const is_master        = req.query.is_master === 'true';
    const includeInactive  = req.query.includeInactive === 'true';
    const is_active        = req.query.is_active !== undefined
                              ? req.query.is_active === 'true'
                              : undefined;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
                              

    const result = await getAdmins({
      filter,
      page,
      limit,
      orderBy,
      is_master,
      is_active,
      includeInactive,
      startDate, endDate,
    });

    // PDF Export Handling
    if (exportType === 'pdf') {
      const templatePath = 'adminuser-report.ejs';

      const data = {
        date: new Date().toLocaleDateString(),
        totalCount: result.total,
        admins: result.admins.map(admin => ({
          username: admin.admin_username || 'N/A',
          email: admin.admin_email || 'N/A',
          phone: admin.admin_phone || 'N/A',
          role: admin.role || 'N/A',
          status: admin.is_active ? 'Active' : 'Inactive'
        }))
      };

      const pdfBuffer = await exportToPdf(templatePath, data);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=admin-users-${Date.now()}.pdf`);
      return res.send(pdfBuffer);
    }

    return res.sendSuccess({ data: { ...result } }, "Admins retrieved successfully");
  } catch (error) {
    console.error('Error retrieving admins:', error);
    return res.sendError('Failed to retrieve admins', 500);
  }
};


// Get admin by ID
export const getAdminByIdCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.sendError('Invalid admin ID', 400);
    }
    const admin = await getAdminById(id);
    return res.sendSuccess({ data :admin }, 200);
  } catch (error) {
    console.error('Error retrieving admin by ID:', error.message);
    return res.sendError(error.message, 500);
  }
};

// Get current admin (/me)
export const getCurrentAdmin = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const admin = await getAdminMe(adminId);
    return res.sendSuccess({data: admin }, "Current admin retrieved successfully");
  } catch (error) {
    console.error('Error in /me:', error.message);
    return res.sendError(error.message, 404);
  }
};

// Admin login
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const result = await loginAdmin({ identifier, password });
    return res.sendSuccess({
      data: {...result},
      
    });
  } catch (error) {
  console.error("Login error:", error.message);
  return res.sendError(error.message, error.statusCode || 500);
}
};

// Update admin
export const updateAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const data = req.body;
    const updated = await updateAdminById(adminId, data);
    if (!updated) {
      return res.sendError('Admin not found', 404 );
    }
    return res.sendSuccess({data:{
        id: updated.id,
        username: updated.admin_username,
        email: updated.admin_email,
        phone: updated.admin_phone,
        role: updated.role,
        updatedAt: updated.updatedAt
      } }, 200)
  } catch (error) {
    console.error('Update error:', error.message);
    return res.sendError( 'Internal Server Error',500)
  }
};

// Deactivate admin (soft delete)
export const deactivateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await softDeleteAdmin(id);
    if (result.status === 'not_found') {
      return res.sendError('Admin not found',404)
    }
    if (result.status === 'already_inactive') {
      return res.sendError('Admin already deactivated' ,400);
    }
    return res.sendSuccess({}, 'Admin deactivated successfully');
  } catch (error) {
    console.error('Deactivation error:', error.message);
    return res.sendError(  'Internal Server Error' ,500);
  }
};

// Restore admin
export const activateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await restoreAdmin(id);
    if (result.status === 'not_found') {
      return res.sendError('Admin not found', 404);
    }
    if (result.status === 'already_active') {
      return res.sendError('Admin already active' , 400);
    }
    return res.status(200).json({ success: true, message: 'Admin restored successfully' });
  } catch (error) {
    console.error('Restore error:', error.message);
    return res.sendSuccess('Internal Server Error', 500);
  }
};


// Global Dashboard Search
export const dashboardGlobalSearchCtrl = async (req, res) => {
  try {
    const searchTerm = (req.query.query || '').trim(); // ✅ change here
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!searchTerm) return res.sendError("Search term is required", 400);

    const result = await dashboardGlobalSearch({ searchTerm, page, limit });

    if (!result.success) {
      return res.sendError(result.message, 400);
    }

    return res.sendSuccess(result.data, result.message);
  } catch (error) {
    console.error("Dashboard Global Search Controller Error:", error.message);
    return res.sendError("Internal Server Error", 500);
  }
};


export const dashboardAdmin = async (req, res) => {
  const result = await dashboard();
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result);
  }
};

// Refresh token
export const handleRefreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.sendError( 'Refresh token required', 400);
  }
  const result = await refreshAdminToken(refreshToken);
  if (!result.success) {
    return res.sendError( result.message ,403);
  }
  return res.sendSuccess({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken
  }, "Tokens refreshed successfully");
};

// Logout 
export const logout = async (req, res) => {
  try {
    const adminId = req.admin.id;
    await logoutAdmin(adminId);
    return res.sendSuccess(null, 'Admin logged out successfully');
  } catch (error) {
    console.error('Logout error:', error.message);
    return res.sendError('Logout failed', 500);
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

export const resetPassword= async (req, res) => {
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
    const AdminuserId = req.admin.id;
    console.log("my id: ", AdminuserId);

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
    }

    const result = await changePassword({ AdminuserId, currentPassword, newPassword });
    res.json(result);
  } catch (err) {
    console.error('✴️ changePassword error:', err.message);
    res.status(400).json({ error: err.message });
  }
};

//VERIFY PASSWORD
export const verifyAdminPasswordController = async (req, res) => {
  try {
    const { password } = req.body;
    const adminId = req.admin.id;

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const isValid = await verifyAdminPasswordService(adminId, password);

    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    return res.status(200).json({ success: true, message: "Password verified successfully" });
  } catch (error) {
    console.error("Password verification error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
