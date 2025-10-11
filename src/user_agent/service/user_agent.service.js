import User_Agent from '../models/user_agent.model.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { Op } from 'sequelize';
import Token from '../models/token.model.js';
import { generateToken, generateRefreshToken } from '../../utils/token.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import order from '../models/orders.model.js'
import Publicurl from '../../endUser/models/public_url.model.js'
import { assign } from 'nodemailer/lib/shared/index.js';
import User from '../../endUser/models/user.model.js'
import Partner from '../models/partner.model.js';
import crypto from 'crypto';
dotenv.config();
//signup

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


export const createUserAgent = async ({ useragent_name, email, phone, partner_id, role }) => {
  const rawPassword = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);

  const hashedPassword = await hashPassword(rawPassword);

  const userAgent = await User_Agent.create({
    useragent_name,
    email,
    phone,
    password: hashedPassword,
    partner_id,
    role
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Your Login Credentials',
    html: `
      <p>Hi <strong>${useragent_name}</strong>,</p>
      <p>Your account has been created. Below are your login credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Password:</strong> ${rawPassword}</li>
      </ul>
      <p>Please log in and change your password immediately.</p>
      <p>With regards,<br>Tagqq Team</p>
    `
  });

  return userAgent;
};

//login
export const loginUser = async ({ identifier, password }) => {
  // Find useragent by email or phone
  const userAgent = await User_Agent.findOne({
    where: {
      [Op.or]: [
        { email: identifier },
        { phone: identifier }
      ]
    }
  });

  if (!userAgent || !(await verifyPassword(password, userAgent.password))) {
    const error = new Error("Invalid email/phone or password");
    error.statusCode = 401;
    throw error;
  }

  if (!userAgent.is_active) {
    const error = new Error("Your account is inactive. Please contact Admin.");
    error.statusCode = 403;
    throw error;
  }

  // Token payload based on userAgent
  const payload = {
    id: userAgent.id,
    email: userAgent.email,
    phone: userAgent.phone,
    partner_id: userAgent.partner_id
  };

  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken({ id: userAgent.id });

  // Check active tokens for this userAgent
  const tokenCount = await Token.count({ where: { useragent_id: userAgent.id } });

  if (tokenCount >= 2) {
    const oldestToken = await Token.findOne({
      where: { useragent_id: userAgent.id },
      order: [['updatedAt', 'ASC']]
    });

    if (oldestToken) {
      // Replace the token value instead of deleting
      oldestToken.token = accessToken;
      await oldestToken.save();
    }
  } else {
    // Create new token if count < 2
    await Token.create({
      useragent_id: userAgent.id,
      token: accessToken
    });
  }
  return {
    accessToken,
    refreshToken,
    email: userAgent.email,
    phone: userAgent.phone,
    partner_id: userAgent.partner_id,
    role: userAgent.role,
    useragent: "true"
  };
};


// Get All UserAgents
export const getUserAgents = async ({
  filter = 'all',
  search = '',
  partnerId = null,
  isMaster = false,
  page = 1,
  limit = 10,
  startDate = null,
  endDate = null,
  orderBy = 'desc'
}) => {
  // build the WHERE clause
  const whereClause = {};
  

  // only apply active/inactive filter if NOT master
  if (!isMaster) {
    if (filter === 'active') whereClause.is_active = true;
    else if (filter === 'inactive') whereClause.is_active = false;
  }

  // partner filter
  if (partnerId) {
    whereClause.partner_id = partnerId;
  }

  // text search
  if (search) {
    whereClause[Op.or] = [
      { phone: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { useragent_name: { [Op.like]: `%${search}%` } }
    ];
  }
  

  // common query options
  const baseOpts = {
    where: whereClause,
    order: [['createdAt', orderBy.toLowerCase() === 'asc' ? 'ASC' : 'DESC']],
    attributes: [
      'id',
      'useragent_name',
      'email',
      'phone',

      'is_active',
      'createdAt',
      'updatedAt'
    ],
    include: [
      {
        model: Partner,
        as: 'partner',
        attributes: ['id', 'name'] // include only necessary fields
      }
    ]
  };
  //  Date range filtering
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      whereClause.createdAt[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      whereClause.createdAt[Op.lt] = nextDay;
    }
  }

  if (isMaster) {
    // no pagination, return all
    const userAgents = await User_Agent.findAll(baseOpts);
    return {
      total: userAgents.length,
      totalPages: 1,
      currentPage: 1,
      userAgents
    };
  } else {
    // paginated path
    const offset = (page - 1) * limit;
    const [userAgents, total] = await Promise.all([
      User_Agent.findAll({
        ...baseOpts,
        limit: parseInt(limit, 10),
        offset
      }),
      User_Agent.count({ where: whereClause })
    ]);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      userAgents
    };
  }
};

// Get UserAgent by ID
export const getUserAgentById = async (id) => {
  const userAgent = await User_Agent.findByPk(id, {
    attributes: [
      "id", "useragent_name", "email", "phone", "partner_id",
      "is_active", "createdAt", "updatedAt"
    ]
  });

  if (!userAgent) {
    throw new Error("User Agent not found");
  }

  return userAgent;
};

// /me
export const getUserAgentMe = async (useragentId) => {
  const userAgent = await User_Agent.findByPk(useragentId, {
    attributes: ["id", "useragent_name", "email", "phone", "partner_id", "is_active", "createdAt"]
  });
  if (!userAgent) throw new Error("UserAgent not found");
  return userAgent;
};

// put
export const updateUserAgentById = async (id, data) => {
  const userAgent = await User_Agent.findByPk(id);
  if (!userAgent) return null;
  await userAgent.update(data);
  return userAgent;
};

//delete
export const softDeleteUserAgent = async (id) => {
  const userAgent = await User_Agent.findByPk(id);
  if (!userAgent) return { status: "not_found" };

  if (!userAgent.is_active) return { status: "already_inactive", userAgent };

  await userAgent.update({ is_active: false });
  return { status: "deactivated" };
};

//patch
export const restoreUserAgent = async (id) => {
  const userAgent = await User_Agent.findByPk(id);
  if (!userAgent) return { status: "not_found" };

  if (userAgent.is_active) return { status: "already_active", userAgent };

  await userAgent.update({ is_active: true });
  return { status: "restored" };
};



export const sendOtpToken = async (email) => {
  const UserAgent = await User_Agent.findOne({ where: { email } });
  if (!UserAgent) throw new Error('User not found');

  const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6‑digit
  const expiresIn = 10 * 60; // 10 minutes
  const jti = uuidv4();       // unique token ID

  // Embed email, otp, jti in the token
  const otpToken = jwt.sign({ email, otp, jti }, OTP_SECRET, { expiresIn });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: UserAgent.email,
    subject: 'Your OTP for Password Reset',
    html: `
      <p>Hi <strong>${UserAgent.useragent_name}</strong>,</p>
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

  const UserAgent = await User_Agent.findOne({ where: { email: payload.email } });
  if (!UserAgent) throw new Error('UserAgent not found');

  const hashed = await hashPassword(newPassword);
  await UserAgent.update({ password: hashed });

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

export const changePassword = async ({ useragentId, currentPassword, newPassword }) => {
  // 1) fetch the user
  const UserAgent = await User_Agent.findByPk(useragentId);
  if (!UserAgent) throw new Error('User not found');

  // 2) verify current password
  const isMatch = await verifyPassword(currentPassword, UserAgent.password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  // 3) hash & update to the new password
  const hashed = await hashPassword(newPassword);
  await UserAgent.update({ password: hashed });

  return { success: true, message: 'Password changed successfully' };
};

export const logoutUserAgent = async ({ useragentId, token }) => {
  const deleted = await Token.destroy({
    where: {
      useragent_id: useragentId,
      token
    }
  });

  if (deleted === 0) {
    const error = new Error('Logout failed: token not found');
    error.statusCode = 404;
    throw error;
  }

  return { message: 'Logout successful' };
};

export async function getDashboardStats({
  userAgentId,
  startDate: startDateParam,
  endDate: endDateParam,
  page = 1,
  limit = 10
}) {
  // 0. Determine if both date params were provided
  const hasDates = startDateParam != null && endDateParam != null;

  // 1. Build an inclusive date range spanning full days, if provided
  let dateRange = null;
  if (hasDates) {
    // Start at the beginning of the startDate
    const start = new Date(startDateParam);
    start.setHours(0, 0, 0, 0);

    // End at the last millisecond of the endDate
    const end = new Date(endDateParam);
    end.setHours(23, 59, 59, 999);

    dateRange = { [Op.gte]: start, [Op.lte]: end };
  }

  // 2. Fetch the user agent and derive partner ID
  const userAgent = await User_Agent.findOne({ where: { id: userAgentId } });
  if (!userAgent) throw new Error('User agent not found');
  const partnerId = userAgent.partner_id;

  // 3. Gather all active order IDs for this partner
  const orderRecords = await order.findAll({
    where: { partner_id: partnerId, is_active: true },
    attributes: ['id']
  });
  const orderIds = orderRecords.map(o => o.id);

  // 4. Aggregate totals
  const total_of_qr_ordered = (await order.sum('no_of_qr_ordered', {
    where: { partner_id: partnerId, is_active: true }
  })) || 0;

  const no_of_qr_ordered = (await order.sum('no_of_qr_ordered', {
    where: {
      partner_id: partnerId,
      is_active: true,
      ...(hasDates ? { createdAt: dateRange } : {})
    }
  })) || 0;

  const total_of_qr_sent = (await order.sum('no_of_qr_ordered', {
    where: { partner_id: partnerId, status: 'fulfillment', is_active: true }
  })) || 0;

  const no_of_qr_sent = (await order.sum('no_of_qr_ordered', {
    where: {
      partner_id: partnerId,
      status: 'fulfillment',
      is_active: true,
      ...(hasDates ? { updatedAt: dateRange } : {})
    }
  })) || 0;

  const total_of_qr_pending = (await order.sum('no_of_qr_ordered', {
    where: { partner_id: partnerId, status: { [Op.not]: 'fulfillment' }, is_active: true }
  })) || 0;

  const no_of_qr_pending = (await order.sum('no_of_qr_ordered', {
    where: {
      partner_id: partnerId,
      status: { [Op.not]: 'fulfillment' },
      is_active: true,
      ...(hasDates ? { createdAt: dateRange } : {})
    }
  })) || 0;

  // 5. Totals for assigned / not assigned URLs
  const total_of_qr_assigned = (await Publicurl.count({
    where: {
      order_id: orderIds.length ? { [Op.in]: orderIds } : null,
      user_id: { [Op.ne]: null }
    }
  })) || 0;

  const total_of_qr_not_assigned = (await Publicurl.count({
    where: {
      order_id: orderIds.length ? { [Op.in]: orderIds } : null,
      user_id: null
    }
  })) || 0;

  const no_of_qr_assigned = (await Publicurl.count({
    where: {
      order_id: orderIds.length ? { [Op.in]: orderIds } : null,
      user_id: { [Op.ne]: null },
      ...(hasDates ? { updatedAt: dateRange } : {})
    }
  })) || 0;

  const no_of_qr_not_assigned = (await Publicurl.count({
    where: {
      order_id: orderIds.length ? { [Op.in]: orderIds } : null,
      user_id: null,
      ...(hasDates ? { createdAt: dateRange } : {})
    }
  })) || 0;

  // 6. Paginated fetch of assigned users
  const offset = (page - 1) * limit;
  const { count, rows } = await Publicurl.findAndCountAll({
    where: {
      order_id: orderIds.length ? { [Op.in]: orderIds } : null,
      user_id: { [Op.ne]: null }
    },
    include: {
      model: User,
      as: 'user',
      attributes: ['id', 'username', 'email', 'phone', 'createdAt'],
      ...(hasDates ? { where: { createdAt: dateRange } } : {})
    },
    offset,
    limit,
    order: [['updatedAt', 'DESC']]
  });

  // 7. Calculate total pages
  const totalPages = Math.ceil(count / limit);

  return {
    total_of_qr_ordered,
    no_of_qr_ordered,
    total_of_qr_sent,
    no_of_qr_sent,
    total_of_qr_pending,
    no_of_qr_pending,
    total_of_qr_assigned,
    no_of_qr_assigned,
    total_of_qr_not_assigned,
    no_of_qr_not_assigned,

    assigned_user: rows,
    assigned_user_count: count,
    assigned_user_page: page,
    assigned_user_limit: limit,
    assigned_user_pages: totalPages
  };
}


