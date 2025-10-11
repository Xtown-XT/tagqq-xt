import {
  createUser,
  getUsers,
  getUserById,
  getMe,
  loginUser,
  updateUserById,
  softDeleteUser,
  restoreUser,
  createUserwithouturl,
  refreshAccessToken,
  logoutUser,
  resetPasswordStateless,
  sendOtpToken,
  userAlreadyExists,
  changePassword
} from '../service/user.service.js';
import exportToPdf from "../../utils/exportPdf.js";


// POST /register
// export const registerUser = async (req, res) => {
//   const { username, email, password, phone } = req.body;
//   const referral_id = req.body?.referral_id
//     ?? req.userAgent?.id
//     ?? req.admin?.id;

//   try {
//     let user = await createUser({ username, email, password, phone, referral_id });
//     user = user.get({ plain: true });
//     return res.sendSuccess(
//       { data: { ...user, password: 'NA' } },
//       'User registered successfully'
//     );
//   } catch (error) {
//     if (error.name === 'SequelizeUniqueConstraintError') {
//       return res.sendError('Username or email already exists', 409);
//     }

//     console.error('Registration error:', error);
//     return res.sendError('Internal Server Error', 500);
//   }
// };

export const registerUser = async (req, res) => {
  const { username, email, password, phone } = req.body;

  // Determine referral_id from body or context (agent/admin)
  const referral_id = req.body?.referral_id
    ?? req.userAgent?.id
    ?? req.admin?.id;

  try {
    const { user, token } = await createUser({
      username,
      email,
      password,
      phone,
      referral_id
    });

    const plainUser = user.get({ plain: true });

    return res.sendSuccess(
      {
        data: {
          ...plainUser,
          password: 'NA',
          token
        }
      },
      'User registered successfully'
    );

  } catch (error) {
    console.error('Registration error:', error);

    // Unique constraint violation (email or username)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.sendError('Username or email already exists', 409);
    }

    // Custom invalid referral ID error
    if (error.message?.startsWith('Invalid referral ID')) {
      return res.sendError(error.message, 400);
    }

    // Sequelize validation (e.g., empty string, format)
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message).join(', ');
      return res.sendError(`Validation error: ${messages}`, 422);
    }

    // Fallback for unknown errors
    return res.sendError('Internal Server Error', 500);
  }
};





export const registerUserwithouturl = async (req, res) => {
  const { username, email, password, phone } = req.body;
  try {
    const user = await createUserwithouturl({ username, email, password, phone });

    return res.sendSuccess(
      { data: { ...user, password: 'NA' } },
      'User registered successfully'
    );
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.sendError('Username or email already exists', 409);
    }

    console.error('Registration error:', error);
    return res.sendError('Internal Server Error', 500);
  }
};

// GET /users
// in your controller file
export const getAll = async (req, res) => {
  try {
    const {
      filter, page, limit, orderBy,
      partnerType, partnerId, agentId,
      search, period,
      startDate, endDate,
      export: exportType, is_master
    } = req.query;

    const result = await getUsers({
      filter: filter || 'all',
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      orderBy: orderBy || 'desc',
      partnerType, partnerId, agentId,
      search, period,
      startDate, endDate,
      currentUser: req.user || null,
      currentAgent: req.userAgent || null,
      isAdmin: Boolean(req.admin),
      isMaster: is_master === "true"
    });
    if (exportType === "pdf") {
      const templatePath = "report.ejs"; // stored under views/
      const data = {
        date: new Date().toLocaleDateString(),
        totalCount: result.total,
        users: result.users.map(user => ({
          name: user.username || "N/A",
          email: user.email || "N/A",
          phone: user.phone || "N/A",
          referral: user.referral_id || "N/A"
        }))
      };

      const pdfBuffer = await exportToPdf(templatePath, data);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=users-${Date.now()}.pdf`
      );

      return res.send(pdfBuffer);
    }
    return res.sendSuccess(result, 'Users retrieved successfully');
  } catch (error) {
    console.error('Error retrieving users:', error);
    return res.sendError('Failed to retrieve users!', 500);
  }
};



// GET /users/:id
export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.sendError('Invalid user ID', 400);
    }

    const result = await getUserById(id);

    if (!result) {
      return res.sendError('User not found', 404);
    }

    return res.sendSuccess({ user: result }, 'User retrieved successfully');
  } catch (error) {
    console.error('Error retrieving user by ID:', error.message);
    return res.sendError('Failed to retrieve user by ID', 500);
  }
};

// GET /me
export const getCurrentUser = async (req, res) => {
  try {
    console.log("hiii", req.user)
    const userId = req.user.id;
    const user = await getMe(userId);

    if (!user) {
      return res.sendError('User not found', 404);
    }

    return res.sendSuccess({ user }, 'Current user retrieved successfully');
  } catch (error) {
    console.error('Error in /me:', error.message);
    return res.sendError('Failed to get current user', 500);
  }
};

// POST /login
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const result = await loginUser({ identifier, password });

    return res.sendSuccess(result, 'Login successful',);
  } catch (error) {
    console.error('Login error:', error.message);
    return res.sendError(error.message || 'Login failed', error.statusCode || 500);
  }
};

// PUT /users/:id
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    const updatedUser = await updateUserById(userId, updateData);

    if (!updatedUser) {
      return res.sendError('User not found', 404);
    }

    return res.sendSuccess(
      {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          phone: updatedUser.phone,
          referral_id: updatedUser.referral_id,
          updatedAt: updatedUser.updatedAt
        }
      },
      'User updated successfully'
    );
  } catch (error) {
    console.error('Update error:', error.message);
    return res.sendError('Internal Server Error', 500);
  }
};

// PATCH /users/:id/deactivate
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await softDeleteUser(id);

    if (result.status === 'not_found') {
      return res.sendError('User not found', 404);
    }

    if (result.status === 'already_inactive') {
      return res.sendError('User is already deactivated', 400);
    }

    return res.sendSuccess(null, 'User deactivated successfully');
  } catch (error) {
    console.error('Soft delete error:', error.message);
    return res.sendError('Internal Server Error', 500);
  }
};


export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await restoreUser(id);

    if (result.status === 'not_found') {
      return res.sendError('User not found', 404);
    }

    if (result.status === 'already_active') {
      return res.sendError('User is already active', 400);
    }

    return res.sendSuccess(null, 'User restored successfully');
  } catch (error) {
    console.error('Restore error:', error.message);
    return res.sendError('Internal Server Error', 500);
  }
};


export const handleRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.sendError('Refresh token required', 400);
    }

    const result = await refreshAccessToken(refreshToken);

    if (!result.success) {
      return res.sendError(result.message, 403);
    }

    return res.sendSuccess(
      {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      },
      'Token refreshed successfully'
    );
  } catch (error) {
    console.error('Refresh token error:', error.message);
    return res.sendError('Failed to refresh token', 500);
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.sendError('Unauthorized', 401);
    }

    await logoutUser(userId);

    return res.sendSuccess(null, 'Logout successful');
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
    const userId = req.user.id;
    console.log("my id: ", userId)
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
    }

    const result = await changePassword({ userId, currentPassword, newPassword });
    res.json(result);
  } catch (err) {
    console.error('✴️ changePassword error:', err.message);
    res.status(400).json({ error: err.message });
  }
};


export const getUserAlreadyExist = async (req, res) => {
  try {
    // ← pull from req.params, not req.query
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const result = await userAlreadyExists(phone);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('getUserAlreadyExist error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};