// import { User } from '../models/index.js';
// import { hashPassword } from '../../utils/index.js';
// import { Op } from 'sequelize';

// class UserService {
//     constructor() {
//         this.user = User;
//         this.hashPassword = hashPassword;
//         this.allowedFilterKeys = ['username', 'email', 'phone', 'is_active'];
//     }

//     async registerUser({ username, email, password, phone }) {
//         try {
//             const hashed = await this.hashPassword(password);

//             const user = await this.user.create({
//                 username,
//                 email,
//                 password: hashed,
//                 phone,
//             });

//             console.log(`User Created Successfully: ${user.username}`);
//             return user;
//         } catch (err) {
//             console.error(`Error Creating User: ${err.message}`);
//             throw new Error(`User Registration Failed in service: ${err.message}`);
//         }
//     }

//     async getUser({  
//         limit = 10,
//         offset = 0,
//         search = '',
//         filter = {},
//         orderBy = 'desc',
//         orderByColumn = 'createdAt',
//         includeInactive = false,
//     }) {
//         try {
//             const invalidFilters = Object.keys(filter).filter(
//                 key => !this.allowedFilterKeys.includes(key)
//             );

//             if (invalidFilters.length > 0) {
//                 throw new Error(`Invalid filter keys: ${invalidFilters.join(', ')}`);
//             }

//             const whereClause = { ...filter };

//             if (search) {
//                 whereClause[Op.or] = [
//                     { username: { [Op.like]: `%${search}%` } },
//                     { email: { [Op.like]: `%${search}%` } },
//                 ];
//             }

//             if (!includeInactive && typeof whereClause.is_active === 'undefined') {
//                 whereClause.is_active = true;
//             }

//             const users = await this.user.findAll({
//                 attributes: ['username', 'email', 'phone', 'is_active', 'createdAt'],
//                 where: whereClause,
//                 limit,
//                 offset,
//                 order: [[orderByColumn, orderBy.toUpperCase()]],
//             });

//             return users.map(u => u.get({ plain: true }));
//         } catch (err) {
//             console.error(`Getting Users Failed in Service: ${err.message}`);
//             throw new Error('Getting Users Failed in Service');
//         }
//     }

//     async getUserById({ id }) {
//         try {
//             if (!id) {
//                 throw new Error("User ID is mandatory for getUserById");
//             }

//             const user = await this.user.findOne({
//                 where: { id },
//                 attributes: ['username', 'email', 'phone', 'is_active', 'createdAt'],
//             });

//             if (!user) {
//                 throw new Error("User not found");
//             }

//             return user.get({ plain: true });
//         } catch (err) {
//             console.error("Getting User By ID Failed in Service:", err.message);
//             throw new Error("Getting User By ID Failed in Service");
//         }
//     }

//     async updateById({ id }, updateSchemas) {
//         try {
//             const user = await this.user.findOne({ where: { id } });

//             if (!user) {
//                 throw new Error("User does not exist");
//             }

//             await user.update(updateSchemas);

//             return {
//                 user: user.get({ plain: true }),
//                 message: "User updated successfully"
//             };
//         } catch (err) {
//             console.error(`Error updating user: ${err.message}`);
//             throw new Error("Failed to update user in service");
//         }
//     }

//     async deleteById({ id }, hardDelete = false) {
//         try {
//             if (!id) {
//                 throw new Error("User ID is mandatory for deleteById");
//             }

//             if (hardDelete) {
//                 await this.user.destroy({ where: { id } });
//                 return { msg: "User permanently deleted" };
//             } else {
//                 const user = await this.user.findOne({ where: { id } });

//                 if (!user) {
//                     throw new Error("User not found for soft delete");
//                 }

//                 await user.update({ is_active: false });

//                 return {
//                     user: user.get({ plain: true }),
//                     msg: "User soft deleted (marked inactive)"
//                 };
//             }
//         } catch (err) {
//             console.error("Error while deleting user:", err.message);
//             throw new Error("Error occurred while deleting the user in service");
//         }
//     }

//     async restoreById({id}){
//         try{
//             const user = await this.user.findOne({id:id})
//             if (!user || user === null || user === undefined){
//                 throw new Error(" User Not Found")
//             }
//             await user.update({is_active:true})
//             return {user: user.get({plain: true}), msg: "User restore Sucessfully in Service"}
//         }
//         catch (err){
//             console.log(`Restoring the user got Error ${user}`);
//             throw new Error("Restoring the use Got Error in Service");

//         }
//     }
// }

// export default userService;

// services/user.service.js
import User from '../models/user.model.js';
import AdminUser from '../../admin_user/models/admin_user.models.js';
import UserAgent from '../../user_agent/models/user_agent.model.js';
import Publicurl from '../models/public_url.model.js';
import { Op } from 'sequelize';
import Partner from '../../user_agent/models/partner.model.js';
import { createUserInfo } from '../../endUser/service/userConfig.service.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import Points from '../../admin_user/models/points.models.js';


// a user “belongs to” whatever created them (agent or admin)



import { hashPassword, generateToken, decodeToken, generateRefreshToken, verifyPassword, decodeRefreshToken } from '../../utils/index.js';
dotenv.config();

User.belongsTo(UserAgent, {
  foreignKey: "referral_id",
  as: "agent",
  constraints: false,      // because referral_id might point to admin instead
  onDelete: 'CASCADE'
});

UserAgent.belongsTo(Partner, {
  foreignKey: "partner_id",
  as: "partner",
  onDelete: 'CASCADE'
});

// (if you also need to access an admin referrer)
User.belongsTo(AdminUser, {
  foreignKey: "referral_id",
  as: "admin",
  constraints: false,
  onDelete: 'CASCADE'
});


// export const createUser = async ({ id, username, email, password, phone, referral_id }) => {
//   const hashedPassword = await hashPassword(password);

//   // 1. Create user
//   const user = await User.create({
//     id,
//     username,
//     email,
//     password: hashedPassword,
//     phone,
//     referral_id: referral_id, 
//   });   



//   await Publicurl.create({
//     status: 'Not paid',
//     created_by: user.id,
//     updated_by: user.id
//   });

//   // 3. Create user config/info
//   await createUserInfo({
//     user_id: user.id,
//     has_profile: true,
//     has_vehicle: true,
//     has_aadhar: true,
//     has_license: true,
//     has_emergency: true
//   });

//   // 4. Generate and assign auth token
//   const payload = {
//     id: user.id,
//     username: user.username,
//     email: user.email,
//     phone: user.phone,
//     referral_id: user.referral_id,
//     is_active: user.is_active
//   };
//   const token = generateToken(payload);
//   user.token = token;

//   // 5. Save token to DB if needed
//   await user.save();

//   return user;
// };


export const createUser = async ({ id, username, email, password, phone, referral_id }) => {
  const hashedPassword = await hashPassword(password);

  // 1. Create the user
  const user = await User.create({
    id,
    username,
    email,
    password: hashedPassword,
    phone,
    referral_id
  });

  // 2. Validate referral_id
  if (referral_id) {
    const [userRef, agentRef, adminRef] = await Promise.all([
      User.findByPk(referral_id),
      UserAgent.findByPk(referral_id),
      AdminUser.findByPk(referral_id)
    ]);

    if (!userRef && !agentRef && !adminRef) {
      throw new Error(`Invalid referral ID: ${referral_id}`);
    }

    // Award points
    await Points.create({
      referral_id,
      points: 10,
      created_by: referral_id,
      updated_by: referral_id
    });
  } else {
    console.warn(`Referral ID ${referral_id} not found in any table. Skipping point reward.`);
  }

  // 3. Create default QR/public URL
  await Publicurl.create({
    status: 'Not paid',
    created_by: user.id,
    updated_by: user.id
  });

  // 4. Create user config/info
  await createUserInfo({
    user_id: user.id,
    has_profile: true,
    has_vehicle: true,
    has_aadhar: true,
    has_license: true,
    has_emergency: true
  });

  // 5. Generate auth token
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    referral_id: user.referral_id,
    is_active: user.is_active
  };

  const token = generateToken(payload);

  return {
    user,
    token
  };
};



export const createUserwithouturl = async ({ id, username, email, password, phone }) => {
  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    id,
    username,
    email,
    password: hashedPassword,
    phone,

  });


  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    is_active: user.is_active
  };

  // create a UserConfig 
  await createUserInfo({
    user_id: user.id,
    has_profile: true,
    has_vehicle: true,
    has_aadhar: true,
    has_license: true,
    has_emergency: true

  });

  const token = generateToken(payload);
  user.token = token;
  await user.save();

  return user;
};


//get all users

export const getUsers = async ({
  filter = "all",
  page = 1,
  limit = 10,
  orderBy = "desc",
  agentId = null,
  partnerId = null,
  partnerType = null,
  search = null,
  period = null,
  startDate = null,
  endDate = null,
  currentUser = null,
  currentAgent = null,
  isAdmin = false,
  isMaster = false
}) => {
  const where = {};
  const include = [];

  // 0) Search filter
  if (search) {
    where[Op.or] = [
      { username: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } }
    ];
  }

  // 1) Filter by is_active
  if (!isMaster) {
    if (filter === "active") where.is_active = true;
    else if (filter === "inactive") where.is_active = false;
  }

  // 2) Role scope restriction
  if (!isAdmin) {
    if (currentUser) where.id = currentUser.id;
    else if (currentAgent) where.referral_id = currentAgent.id;
    else return { total: 0, totalPages: 0, currentPage: page, users: [] };
  }

  // 3) Date range filtering
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
  // 4) Period filter
  else if (period) {
    const now = new Date();
    let start;
    switch (period) {
      case "daily": start = new Date(now.setHours(0, 0, 0, 0)); break;
      case "weekly": start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case "monthly": start = new Date(now.getFullYear(), now.getMonth(), 1); break;
      case "yearly": start = new Date(now.getFullYear(), 0, 1); break;
    }
    if (start) {
      where.createdAt = { [Op.gte]: start };
    }
  }

  // 5) Filters for partner/agent
  if (partnerType) {
    include.push({
      model: UserAgent,
      as: "agent",
      required: true,
      include: [{ model: Partner, as: "partner", where: { partner_type: partnerType } }]
    });
  }

  if (agentId) {
    include.push({ model: UserAgent, as: "agent", where: { id: agentId } });
  }

  if (partnerId) {
    include.push({
      model: UserAgent,
      as: "agent",
      required: true,
      include: [{ model: Partner, as: "partner", where: { id: partnerId } }]
    });
  }

  // 6) Pagination & fetch
  const offset = (page - 1) * limit;

  const findOptions = {
    where,
    include,
    attributes: [
      "id", "username", "email", "phone", "referral_id",
      "is_active", "createdAt", "updatedAt"
    ],
    order: [["createdAt", orderBy.toLowerCase() === "asc" ? "ASC" : "DESC"]]
  };

  if (!isMaster) {
    findOptions.limit = parseInt(limit, 10);
    findOptions.offset = parseInt(offset, 10);
  }

  const users = await User.findAll(findOptions);
  const total = await User.count({ where, include });
  const totalPages = isMaster ? 1 : Math.ceil(total / limit);

  // 7) Post-process referral_id to include referral info
  const referralIds = users
    .map(u => u.referral_id)
    .filter(id => !!id);

  const [userAgents, admins] = await Promise.all([
    UserAgent.findAll({ where: { id: referralIds } }),
    AdminUser.findAll({ where: { id: referralIds } })
  ]);

  const userAgentMap = Object.fromEntries(
    userAgents.map(ua => [
      ua.id,
      {
        username: ua.useragent_name,  // or useragent_name if renamed in alias
        email: ua.email,
        role: 'User Agent'
      }
    ])
  );

  const adminMap = Object.fromEntries(
    admins.map(ad => [
      ad.id,
      {
        username: ad.admin_username,
        email: ad.email,
        role: 'Admin'
      }
    ])
  );
  const enrichedUsers = users.map(user => {
    const referralInfo = userAgentMap[user.referral_id] || adminMap[user.referral_id] || null;
    return {
      ...user.get(),
      referral_info: referralInfo
    };
  });

  return {
    total,
    totalPages,
    currentPage: page,
    users: enrichedUsers
  };
};


//get by Id
export const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: ["id", "username", "email", "phone", "referral_id", "is_active", "createdAt", "token"]
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user
};

//get by Email Id
export const getUserByMail = async (email) => {
  const user = await User.findOne({
    where: { email }
  });

  if (!user) {
    throw new Error(`User with email ${email} not found`);
  }

  return user;
};



export const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "username", "email", "phone", "referral_id", "is_active", "createdAt"]
  });

  if (!user) throw new Error("User not found");

  // Fetch all public URLs for the user
  const publicUrls = await Publicurl.findAll({ where: { user_id: userId } });

  // Determine QR status
  let qr = false;
  if (publicUrls.length > 0 && publicUrls.some(url => ['Paid', 'Active'].includes(url.status))) {
    qr = true;
  }

  // Attach QR to user object
  const userWithQR = {
    ...user.toJSON(),
    qr,
  };

  return userWithQR;
};



//login
export const loginUser = async ({ identifier, password }) => {
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: identifier },
        { phone: identifier }
      ]
    }
  });

  if (!user || !(await verifyPassword(password, user.password))) {
    const error = new Error("Invalid email/phone or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.is_active) {
    const error = new Error("Your account is inactive. Please contact Admin.");
    error.statusCode = 403;
    throw error;
  }

  const accessToken = generateToken({
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    referral_id: user.referral_id,
    is_active: user.is_active,

  });

  const refreshToken = generateRefreshToken({ id: user.id });

  await user.update({ token: accessToken, refresh_token: refreshToken });

  return {
    accessToken,
    refreshToken,
    username: user.username,
    email: user.email,
    enduser: "true"
  };
};

//update
export const updateUserById = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.update(data);
  return user;
};

// Soft delete user
export const softDeleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return { status: "not_found" };

  if (!user.is_active) return { status: "already_inactive", user };

  await user.update({ is_active: false });
  return { status: "deactivated" };
};

// Restore user
export const restoreUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) return { status: "not_found" };

  if (user.is_active) return { status: "already_active", user };

  await user.update({ is_active: true });
  return { status: "restored" };
};

//refresh token
export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = decodeRefreshToken(refreshToken);

    // Optionally: Verify user exists or is active from DB

    const newAccessToken = generateToken({ id: decoded.id, email: decoded.email });
    await updateUserById(decoded.id, { token: newAccessToken })
    const newRefreshToken = generateRefreshToken({ id: decoded.id, email: decoded.email });

    return {
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Logout User 
export const logoutUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User not found");
  }

  await user.update({
    token: null,
    refresh_token: null
  });

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

export const sendOtpToken = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('User not found');

  const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6‑digit
  const expiresIn = 10 * 60; // 10 minutes
  const jti = uuidv4();       // unique token ID

  // Embed email, otp, jti in the token
  const otpToken = jwt.sign({ email, otp, jti }, OTP_SECRET, { expiresIn });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Your OTP for Password Reset',
    html: `
      <p>Hi <strong>${user.username}</strong>,</p>
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

  const user = await User.findOne({ where: { email: payload.email } });
  if (!user) throw new Error('User not found');

  const hashed = await hashPassword(newPassword);
  await user.update({ password: hashed });

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


export const changePassword = async ({ userId, currentPassword, newPassword }) => {
  // 1) fetch the user
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  // 2) verify current password
  const isMatch = await verifyPassword(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  // 3) hash & update to the new password
  const hashed = await hashPassword(newPassword);
  await user.update({ password: hashed });

  return { success: true, message: 'Password changed successfully' };
};


export const userAlreadyExists = async (phone) => {
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ phone }],
    },
  });

  if (existingUser) {
    return {
      is_user: true,
      phone,
      name: existingUser.name,
      message: 'go to login page',
    };
  } else {
    return {
      is_user: false,
      message: 'go to register page',
    };
  }
};





// const service = new UserService();

// const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
// let createdUserId = null;

// // 1. Register User
// (async () => {
//     try {
//         const result = await service.registerUser({
//             username: 'test_user',
//             email: `test_user_${Date.now()}@example.com`, // avoid duplicate
//             password: 'password123',
//             phone: '1234567890',
//         });
//         createdUserId = result.id;
//         console.log('✅ Test Passed - User Created:', result);
//     } catch (error) {
//         console.error('❌ Test Failed - registerUser:', error.message);
//     }
// })();

// // 2. Wait then get users
// setTimeout(async () => {
//     try {
//         const users = await service.getUser({
//             limit: 5,
//             offset: 0,
//             search: 'test',
//             filter: {},
//             orderBy: 'desc',
//             orderByColumn: 'createdAt',
//         });
//         console.log('✅ Test Passed - Users Fetched:', users);
//     } catch (err) {
//         console.error('❌ Test Failed - getUser:', err.message);
//     }
// }, 1000);

// // 3. Wait then get by ID
// setTimeout(async () => {
//     try {
//         const result = await service.getUserById({ id: createdUserId });
//         console.log('✅ Test Passed - Get User By ID:', result);
//     } catch (err) {
//         console.error('❌ Test Failed - getUserById:', err.message);
//     }
// }, 2000);

// // 4. Update user
// setTimeout(async () => {
//     try {
//         const result = await service.updateById({ id: createdUserId }, {
//             username: 'updated_username',
//             phone: '9876543210'
//         });
//         console.log('✅ Test Passed - User Updated:', result);
//     } catch (err) {
//         console.error('❌ Test Failed - updateById:', err.message);
//     }
// }, 3000);

// // 5. Soft delete
// setTimeout(async () => {
//     try {
//         const result = await service.deleteById({ id: createdUserId }, false);
//         console.log('✅ Test Passed - User Soft Deleted:', result);
//     } catch (err) {
//         console.error('❌ Test Failed - deleteById (soft):', err.message);
//     }
// }, 4000);

// // 6. Restore
// setTimeout(async () => {
//     try {
//         const result = await service.restoreById({ id: createdUserId });
//         console.log('✅ Test Passed - User Restored:', result);
//     } catch (err) {
//         console.error('❌ Test Failed - restoreById:', err.message);
//     }
// }, 5000);

// // 7. Hard delete
// setTimeout(async () => {
//     try {
//         const result = await service.deleteById({ id: createdUserId }, true);
//         console.log('✅ Test Passed - User Hard Deleted:', result);
//     } catch (err) {
//         console.error('❌ Test Failed - deleteById (hard):', err.message);
//     }
// }, 6000);