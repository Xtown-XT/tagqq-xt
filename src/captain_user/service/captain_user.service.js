import CaptainUser from '../models/captain_user.models.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { Op } from 'sequelize';
import { generateToken, generateRefreshToken, decodeRefreshToken } from '../../utils/token.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

import Profile from '../../endUser/models/profile.models.js';

import { differenceInDays } from 'date-fns';


dotenv.config();

const usedOtpMap = new Map();
const OTP_SECRET = process.env.OTP_SECRET;

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

// Generate emp_id like CAP0001
const getNextEmpId = async () => {
  const lastUser = await CaptainUser.findOne({
    order: [['createdAt', 'DESC']],
    attributes: ['emp_id'],
    where: {
      emp_id: { [Op.ne]: null }
    }
  });

  let nextId = 1;
  if (lastUser && lastUser.emp_id) {
    const lastNumber = parseInt(lastUser.emp_id.replace('CAP', ''), 10);
    if (!isNaN(lastNumber)) {
      nextId = lastNumber + 1;
    }
  }

  return `CAP${nextId.toString().padStart(4, '0')}`;
};

// register
export const createCaptainUser = async ({ name = '', email = '', phone, password = '' }) => {
  if (!phone) {
    throw new Error('Phone number is required');
  }

  // Check for existing phone or email
  const existingUser = await CaptainUser.findOne({
    where: {
      [Op.or]: [
        { phone },
        ...(email ? [{ email }] : [])
      ]
    }
  });

  if (existingUser) {
    if (existingUser.phone === phone) {
      throw new Error('Phone number already exists');
    }
    if (email && existingUser.email === email) {
      throw new Error('Email already exists');
    }
  }

  // const rawPassword = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  const hashedPassword = await hashPassword(password);
  const emp_id = await getNextEmpId();

  // Create the user first
  const user = await CaptainUser.create({
    name,
    email: email || null,
    phone,
    password: hashedPassword,
    emp_id
  });

  // Now generate the token after the user is created
  const payload = {
    id: user.id,
    email: user.email,
    phone: user.phone,
    emp_id: user.emp_id
  };

  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken({ id: user.id });

  // Save the access token in DB for captain authentication check
  await user.update({ token: accessToken });

  // if (email) {
  //   await transporter.sendMail({
  //     from: process.env.EMAIL_FROM,
  //     to: email,
  //     subject: 'Your Captain Login Credentials',
  //     html: `
  //       <p>Hi <strong>${name || 'User'}</strong>,</p>
  //       <p>Your account has been created. Below are your login credentials:</p>
  //       <ul>
  //         <li><strong>Email:</strong> ${email}</li>
  //         <li><strong>Password:</strong> ${rawPassword}</li>
  //       </ul>
  //       <p>Please log in and change your password immediately.</p>
  //     `
  //   });
  // }

  return {
    id: user.id,
    emp_id: user.emp_id,
    accessToken,
    refreshToken,
    email: user.email,
    phone: user.phone,
    captain: true
  };
};


export const loginCaptainUser = async ({ identifier, password }) => {

  const user = await CaptainUser.findOne({
    where: {
      [Op.or]: [{ email: identifier }, { phone: identifier }]
    },
    paranoid: false
  });

  if (!user || !(await verifyPassword(password, user.password))) {
    const error = new Error(user ? "Invalid password" : "User not found or check the email/phone");
    error.statusCode = 401;
    throw error;
  }

  let reactivated = false;

  if (!user.is_active || user.deletedAt) {
    const referenceDate = user.deletedAt || user.updatedAt;
    const daysSinceInactive = differenceInDays(new Date(), new Date(referenceDate));

    if (daysSinceInactive <= 15) {
      await user.update({ is_active: true, deletedAt: null });
      reactivated = true;
    } else {
      const error = new Error("Your account is deactivated. Contact admin.");
      error.statusCode = 403;
      throw error;
    }
  }

  //  Generate tokens
  const payload = { id: user.id, email: user.email, phone: user.phone };
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken({ id: user.id });

  // Save access token
  await user.update({ token: accessToken });

  //  Return response
  return {
    accessToken,
    refreshToken,
    email: user.email,
    phone: user.phone,
    captain: true,
    reactivated
  };
};



export const getCaptainUsers = async ({
  search = '',
  page = 1,
  limit = 10,
  orderBy = 'desc',
  is_master = false
}) => {
  const where = {};

  if (search) {
    where[Op.or] = [
      { phone: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { name: { [Op.like]: `%${search}%` } },
      { emp_id: { [Op.like]: `%${search}%` } },
    ];
  }

  const queryOptions = {
    where,
    order: [['createdAt', orderBy.toLowerCase() === 'asc' ? 'ASC' : 'DESC']],
    attributes: ['id', 'name', 'image', 'selfi_image', 'emp_id', 'email', 'phone', 'aadhaar', 'address', 'is_active', 'createdAt'],
  };

  if (!is_master) {
    queryOptions.offset = (page - 1) * limit;
    queryOptions.limit = limit;
  }

  const [users, total] = await Promise.all([
    CaptainUser.findAll(queryOptions),
    CaptainUser.count({ where })
  ]);

  return {
    total,
    totalPages: is_master ? 1 : Math.ceil(total / limit),
    currentPage: is_master ? 1 : page,
    users
  };
};

export const getCaptainUserById = async (id) => {
  const user = await CaptainUser.findByPk(id, {
    attributes: ['id', 'name', 'email', 'phone', 'is_active', "token", 'createdAt', 'updatedAt']
  });
  if (!user) throw new Error("Captain user not found");
  return user;
};

export const getCaptainUserMe = async (id) => {
  const user = await CaptainUser.findByPk(id, {
    attributes: ['id', 'name', 'email', 'phone', 'is_active', 'createdAt', 'image', 'selfi_image']
  });

  if (!user) throw new Error("Captain user not found");

  const userJson = user.toJSON();
  // Check Aadhaar verification status
  const aadhaarProfile = await Profile.findOne({
    where: {
      captain_id: id,
      docs_name: 'Aadhar',
    }
  });


  // Compute image status
  userJson.image_status = !!(userJson.image && userJson.selfi_image); // true only if both exist
  userJson.aadhaar_verified = !!aadhaarProfile;

  return userJson;
};


export const updateCaptainUserById = async (id, data) => {
  const user = await CaptainUser.findByPk(id);
  if (!user) return null;

  // Handle password update logic
  if (data.password && data.password.trim() !== '') {
    // Check if user already has a password
    if (user.password && user.password.trim() !== '') {
      throw new Error('Password already set. Use change password or forgot password flow.');
    }
    data.password = await hashPassword(data.password);
  } else {
    // Prevent overwriting password with empty value
    delete data.password;
  }

  await user.update(data);
  return user;
};



export const softDeleteCaptainUser = async (id) => {
  const user = await CaptainUser.findByPk(id);
  if (!user) return { status: "not_found" };
  if (!user.is_active && user.deletedAt) return { status: "already_inactive" };


  await user.update({ is_active: false });
  return { status: "deactivated" };
};

export const restoreCaptainUser = async (captainId) => {
  if (!captainId || typeof captainId !== "string") {
    return { status: "invalid_id" };
  }

  const user = await CaptainUser.findOne({
    where: { id: captainId },
    paranoid: false,
  });

  if (!user) return { status: "not_found" };

  if (user.is_active && !user.deletedAt) return { status: "already_active" };

  await user.update({ is_active: true, deletedAt: null });


  return { status: "restored" };
};

export const sendOtpToken = async (email) => {
  const user = await CaptainUser.findOne({ where: { email } });
  if (!user) throw new Error('User not found');

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresIn = 10 * 60;
  const jti = uuidv4();

  const otpToken = jwt.sign({ email, otp, jti }, OTP_SECRET, { expiresIn });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'OTP for Password Reset',
    html: `
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your OTP is:</p>
      <h2>${otp}</h2>
      <p>It expires in 10 minutes. Don’t share it.</p>
    `
  });

  return { success: true, otpToken };
};

export const resetPasswordStateless = async ({ otpToken, otp, newPassword }) => {
  let payload;
  try {
    console.log('payload', otpToken, otp, newPassword)
    payload = jwt.verify(otpToken, OTP_SECRET);

  } catch {
    throw new Error('Invalid or expired OTP token');
  }

  if (usedOtpMap.has(payload.jti)) {
    throw new Error('OTP already used');
  }

  if (payload.otp !== otp) {
    throw new Error('Incorrect OTP');
  }

  const user = await CaptainUser.findOne({ where: { email: payload.email } });
  if (!user) throw new Error('Captain user not found');

  const hashed = await hashPassword(newPassword);
  await user.update({ password: hashed });

  usedOtpMap.set(payload.jti, Date.now());

  return { success: true, message: 'Password updated successfully' };
};

setInterval(() => {
  const now = Date.now();
  for (const [jti, usedAt] of usedOtpMap) {
    if (now - usedAt > 30 * 60 * 1000) {
      usedOtpMap.delete(jti);
    }
  }
}, 4 * 60 * 1000);

export const changeCaptainPassword = async ({ captainId, currentPassword, newPassword }) => {
  console.log('captainId, currentPassword, newPassword', captainId, currentPassword, newPassword)
  const user = await CaptainUser.findByPk(captainId);

  console.log("User data", user)

  if (!user) throw new Error('User not found');

  const isMatch = await verifyPassword(currentPassword, user.password);
  if (!isMatch) throw new Error('Current password is incorrect');

  const hashed = await hashPassword(newPassword);
  await user.update({ password: hashed });

  return { success: true, message: 'Password changed successfully' };
};

export const logoutCaptainUser = async () => {
  // Stateless JWT logout: client should discard token
  return { message: 'Logout successful (stateless)' };
};

export const captainAlreadyExists = async (phone) => {
  const user = await CaptainUser.findOne({
    where: {
      [Op.or]: [{ phone }],
    },
    paranoid: false,
  });

  if (user) {
    if (user.is_active === false && user.deletedAt) {
      const deletedDate = new Date(user.deletedAt);
      const currentDate = new Date();
      const differenceInDays = Math.floor((currentDate - deletedDate) / (1000 * 60 * 60 * 24));

      if (differenceInDays <= 15) {
        return {
          is_user: true,
          is_deleted: true,
          phone,
          name: user.name,
          message: "This account is in the deletion process. Are you sure you want to activate the account?",
        };
      } else {
        return {
          is_user: false,
          is_deleted: true,
          message: "This account has been deleted. Please create a new account.",
        };
      }
    }

    return {
      is_user: true,
      phone,
      name: user.name,
      message: "Go to login page",
    };
  }

  return {
    is_user: false,
    message: "Go to register page",
  };
};

export const refreshCaptainAccessToken = async (refreshToken) => {
  try {
    const decoded = decodeRefreshToken(refreshToken);

    // Optional: Check if captain user still exists and is active
    const user = await CaptainUser.findByPk(decoded.id);
    if (!user || !user.is_active) {
      throw new Error('Invalid or inactive captain user');
    }

    const payload = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      emp_id: user.emp_id
    };

    const newAccessToken = generateToken(payload);
    const newRefreshToken = generateRefreshToken({ id: user.id });

    await user.update({ token: newAccessToken });

    return {
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };

  } catch (error) {
    return { success: false, message: error.message };
  }
};