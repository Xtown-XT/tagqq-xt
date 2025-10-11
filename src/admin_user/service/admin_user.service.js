import Adminuser from '../models/admin_user.models.js';
import { Op, where, Sequelize } from 'sequelize';
import {
  hashPassword,
  generateToken,
  generateRefreshToken,
  verifyPassword,
  decodeRefreshToken
} from '../../utils/index.js';
import User from '../../endUser/models/user.model.js'
import Partner from '../../user_agent/models/partner.model.js'
import Publicurl from '../../endUser/models/public_url.model.js';
import profile from '../../endUser/models/profile.models.js';
import Order from '../../endUser/models/order_traking.models.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';




// Create a new admin user
export const createAdmin = async ({ username, email, password, phone, role }) => {
  const hashedPassword = await hashPassword(password);
  const admin = await Adminuser.create({
    admin_username: username,
    admin_email: email,
    admin_password: hashedPassword,
    admin_phone: phone,
    role
  });

  const payload = {
    id: admin.id,
    username: admin.admin_username,
    email: admin.admin_email,
    phone: admin.admin_phone,
    role: admin.role,
    is_active: admin.is_active
  };
  const token = generateToken(payload);
  const refreshToken = generateRefreshToken({ id: admin.id });

  admin.token = token;
  admin.refresh_token = refreshToken;
  await admin.save();

  return admin;
};

// Get all admin users with optional filter, pagination, and sort
export const getAdmins = async ({
  filter = 'all',
  page = 1,
  limit = 10,
  orderBy = 'desc',
  is_master = false,
  is_active,
  includeInactive = false,
  startDate = null,
  endDate = null,
}) => {
  const where = {};
  //  Date range filtering
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.createdAt[Op.lt] = nextDay;
    }
  }
  // Smart is_active filtering
  if (is_master) {
    if (typeof is_active === 'boolean') {
      where.is_active = is_active;
    }
    // else, allow both active and inactive
  } else {
    if (typeof is_active === 'boolean') {
      where.is_active = is_active;
    } else if (!includeInactive) {
      where.is_active = true; // default only active for normal users
    }
  }

  const offset = (page - 1) * limit;

  const { rows: admins, count: total } = await Adminuser.findAndCountAll({
    where,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    order: [['createdAt', orderBy.toLowerCase() === 'asc' ? 'ASC' : 'DESC']],
    attributes: [
      'id',
      'admin_username',
      'admin_email',
      'admin_phone',
      'role',
      'is_active',
      'createdAt',
      'updatedAt'
    ]
  });

  const totalPages = Math.ceil(total / limit);
  return { total, totalPages, currentPage: page, admins };
};


// Get an admin user by ID
export const getAdminById = async (id) => {
  const admin = await Adminuser.findByPk(id, {
    attributes: ['id', 'admin_username', 'admin_email', 'admin_phone', 'role', 'is_active', 'createdAt']
  });
  if (!admin) throw new Error('Admin user not found');
  return admin;
};

// Get current admin (/me)
// src/service/admin_user.service.js
export const getAdminMe = async (adminId) => {
  const admin = await Adminuser.findByPk(adminId, {
    attributes: [
      "id",
      "admin_username",
      "admin_email",
      "admin_phone",
      "role",
      "is_active",
      "createdAt"
    ]
  });

  if (!admin) throw new Error("Admin not found");
  return admin;
};


// Admin login
export const loginAdmin = async ({ identifier, password }) => {
 
  const admin = await Adminuser.findOne({
    where: {
      [Op.or]: [
        { admin_email: identifier },
        { admin_username: identifier },
        { admin_phone: identifier },
      ]
    }
  });
   console.log("Admin result:", admin);
  if (!admin || !(await verifyPassword(password, admin.admin_password))) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }
  if (!admin.is_active) {
    const error = new Error('Account inactive. Contact Super Admin.');
    error.statusCode = 403;
    throw error;
  }

  const payload = {
    id: admin.id,
    username: admin.admin_username,
    email: admin.admin_email,
    phone: admin.admin_phone,
    role: admin.role,
    is_active: admin.is_active
  };
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken({ id: admin.id });

  await admin.update({ token: accessToken, refresh_token: refreshToken });
  console.log('Token in DB:', admin.token);
  return { accessToken, refreshToken, username: admin.admin_username, email: admin.admin_email, role: admin.role };
};

// Update admin user by ID
export const updateAdminById = async (id, data) => {
  const admin = await Adminuser.findByPk(id);
  if (!admin) return null;
  if (data.password) data.admin_password = await hashPassword(data.password);
  await admin.update(data);
  return admin;
};

// Soft delete (deactivate) admin user
export const softDeleteAdmin = async (id) => {
  const admin = await Adminuser.findByPk(id);
  if (!admin) return { status: 'not_found' };
  if (!admin.is_active) return { status: 'already_inactive', admin };
  await admin.update({ is_active: false });
  return { status: 'deactivated' };
};

// Restore (reactivate) admin user
export const restoreAdmin = async (id) => {
  const admin = await Adminuser.findByPk(id);
  if (!admin) return { status: 'not_found' };
  if (admin.is_active) return { status: 'already_active', admin };
  await admin.update({ is_active: true });
  return { status: 'restored' };
};

// Refresh access token for admin
export const refreshAdminToken = async (refreshToken) => {
  try {
    const decoded = decodeRefreshToken(refreshToken);
    const accessToken = generateToken({ id: decoded.id });
    const newRefreshToken = generateRefreshToken({ id: decoded.id });
    await Adminuser.update({ token: accessToken, refresh_token: newRefreshToken }, { where: { id: decoded.id } });
    return { success: true, accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    return { success: false, message: error.message };
  }
};


export const dashboard = async () => {
  try {
    const totalUsers = await User.count();
    const totalPartner = await Partner.count();
    const totalPublicurl = await Publicurl.count();
    const Vehicle = await profile.count({
      where: { docs_name: "RC" }
    });
    const partner_showroom = await Partner.count({
      where: { partner_type: "showroom" }
    });

    const enduserofPartner = await Publicurl.count({
      where: {
        order_id: {
          [Op.ne]: null
        },
        user_id: {
          [Op.eq]: null
        }
      }
    });
    const enduserwithoutPartner = await User.count({
      where: {
        referral_id: {
          [Op.eq]: null
        }

      }
    });
    const qrcreateNotuse = await Publicurl.count({
      where: {
        user_id: {
          [Op.eq]: null
        }
      }
    });
    const qractiveusers = await Publicurl.count({
      where: {
        status: {
          [Op.in]: ['Active', 'Paid']
        }
      }
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyEndUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: oneWeekAgo
        }
      }
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyEndUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    const vehicleCount = await profile.count({
      where: {
        docs_name: "RC"
      }
    });


    return {
      success: true,
      totalUsers,
      totalPartner,
      totalPublicurl,
      Vehicle,
      enduserofPartner,
      enduserwithoutPartner,
      qrcreateNotuse,
      partner_showroom,
      qractiveusers,
      weeklyEndUsers,
      monthlyEndUsers,
      vehicleCount
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Logout admin 
export const logoutAdmin = async (adminId) => {
  const admin = await Adminuser.findByPk(adminId);
  if (!admin) {
    throw new Error("Admin not found");
  }

  admin.token = null;
  admin.refresh_token = null;
  await admin.save();

  return { success: true };
};


const usedOtpMap = new Map();
const OTP_SECRET = process.env.OTP_SECRET;
// Set up your Zoho SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: { rejectUnauthorized: false }
});

transporter.verify((err) => {
  if (err) console.error('🚨 SMTP error:', err);
  // else    console.log('✅ SMTP ready to send messages');
});

export const sendOtpToken = async (admin_email) => {
  const AdminUser = await Adminuser.findOne({ where: { admin_email } });
  if (!AdminUser) throw new Error('Admin not found');

  const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6‑digit
  const expiresIn = 10 * 60; // 10 minutes
  const jti = uuidv4();       // unique token ID

  // Embed email, otp, jti in the token
  const otpToken = jwt.sign({ admin_email, otp, jti }, OTP_SECRET, { expiresIn });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: AdminUser.admin_email,
    subject: 'Your OTP for Password Reset',
    html: `
      <p>Hi <strong>${AdminUser.admin_username}</strong>,</p>
      <p>Your OTP is:</p>
      <h2>${otp}</h2>
      <p>It expires in 5 minutes. Don’t share it.</p>
    `
  });

  return { success: true, otpToken };
};

export const resetPasswordStateless = async ({ otpToken, otp, newPassword }) => {
  let payload;
  try {
    payload = jwt.verify(otpToken, OTP_SECRET);
  } catch {
    throw new Error('Invalid or expired OTP token');
  }

  // Prevent reuse of the same jti
  if (usedOtpMap.has(payload.jti)) {
    throw new Error('OTP already used');
  }

  if (payload.otp !== otp) {
    throw new Error('Incorrect OTP');
  }

  const AdminUser = await Adminuser.findOne({ where: { admin_email: payload.admin_email } });
  if (!AdminUser) throw new Error('Admin User not found');

  const hashed = await hashPassword(newPassword);
  await AdminUser.update({ password: hashed });

  // Mark this OTP (jti) as used
  usedOtpMap.set(payload.jti, Date.now());

  return { success: true, message: 'Password updated successfully' };
};

// Optional: cleanup old entries every 30 mins
setInterval(() => {
  const now = Date.now();
  for (const [jti, usedAt] of usedOtpMap) {
    if (now - usedAt > 30 * 60 * 1000) {
      usedOtpMap.delete(jti);
    }
  }
}, 4 * 60 * 1000);

export const changePassword = async ({ AdminuserId, currentPassword, newPassword }) => {
  const AdminUser = await Adminuser.findOne({
    where: { id: AdminuserId },
    attributes: ['id', 'admin_password']
  });

  if (!AdminUser) throw new Error('User not found');

  console.log("currentPassword:", currentPassword);
  console.log("AdminUser.admin_password:", AdminUser.admin_password);

  const isMatch = await verifyPassword(currentPassword, AdminUser.admin_password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  const hashed = await hashPassword(newPassword);
  await AdminUser.update({ admin_password: hashed });

  return { success: true, message: 'Password changed successfully' };
};


// VERIFY PASSWORD
export const verifyAdminPasswordService = async (adminId, password) => {
  const admin = await Adminuser.findByPk(adminId);

  if (!admin) {
    throw new Error('Admin not found');
  }


  if (!password || !admin.admin_password) {
    throw new Error('Missing password or hash');
  }

  const isMatch = await bcrypt.compare(password, admin.admin_password);
  return isMatch;
};

