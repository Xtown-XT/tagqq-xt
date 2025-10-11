import Publicurl from '../models/public_url.model.js';
import User from '../models/user.model.js';
import Orders from '../../user_agent/models/orders.model.js';
import { Op } from 'sequelize';
import Profile from '../models/profile.models.js';
import { hashPassword } from '../../utils/index.js'
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Points from '../../admin_user/models/points.models.js'

dotenv.config();

Publicurl.belongsTo(Orders, { foreignKey: 'order_id', as: 'orders', onDelete: 'CASCADE', });
// publicurl.belongsTo(Users,{ foreignKey: 'user_id', as: 'user' ,onDelete: 'CASCADE',});


if (!Publicurl.associations?.user) {
  Publicurl.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
}
if (!User.associations?.publicUrls) {
  User.hasMany(Publicurl, { foreignKey: 'user_id', as: 'publicUrls' });
}

if (!Profile.associations?.user) {
  Profile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
}
if (!User.associations?.profiles) {
  User.hasMany(Profile, { foreignKey: 'user_id', as: 'profiles' });
}

// Service functions
export async function createPublicUrl({ user_id, status = 'Not paid', created_by = null }) {
  try {
    const publicUrl = await Publicurl.create({ user_id, status, created_by });
    console.log(`Public URL Created Successfully: ${publicUrl.id}`);
    return publicUrl;
  } catch (err) {
    console.error(`Error Creating Public URL: ${err.message}`, err);
    throw err;
  }
}

export async function getPublicUrls({
  includeInactive = false,
  user_id,
  status,
  startDate,
  endDate,
  page = 1,
  limit = 10,
  orderBy = 'createdAt',
  order = 'asc',
  userAgentPartnerId,
  isMaster = false
} = {}) {
  const where = {};

  if (!includeInactive) where.is_active = true;
  if (user_id) where.user_id = user_id;
  if (status) where.status = status;

  // Filter by date range
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.createdAt[Op.lt] = nextDay;
    }
  }

  const offset = (page - 1) * limit;
  const orderClause = [[orderBy, order.toUpperCase()]];

  const include = [
    {
      model: User,
      as: 'user',
      attributes: ['id', 'username', 'email', 'phone'],
      include: [
        {
          model: Profile,
          as: 'profiles',
          attributes: ['id', 'docs_name', 'data', 'id_number', 'is_active'],
          where: includeInactive ? {} : { is_active: true },
          required: false,
        },
      ],
    },
  ];

  // Orders relationship based on isMaster and userAgentPartnerId
  if (isMaster) {
    include.push({
      model: Orders,
      as: 'orders',
      attributes: ['id', 'partner_id'],
      required: true,
    });

    return await Publicurl.findAndCountAll({
      where,
      distinct: true,
      order: orderClause,
      include,
    });
  }

  if (userAgentPartnerId) {
    include.push({
      model: Orders,
      as: 'orders',
      attributes: ['id', 'partner_id'],
      where: { partner_id: userAgentPartnerId, status: 'fulfillment' },
      required: true,
    });
  }

  try {
    return await Publicurl.findAndCountAll({
      where,
      offset,
      limit,
      distinct: true,
      order: orderClause,
      include,
    });
  } catch (err) {
    console.error('Sequelize error in getPublicUrls():', err);
    throw err;
  }
}

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

export async function createEmergencyUser({ publicUrlId, userData, agentID }) {
  const url = await Publicurl.findByPk(publicUrlId);
  if (!url) throw new Error('Public URL not found');

  if (url.user_id) throw new Error('This QR code is already assigned to a user.');

  // 🚫 Check for existing user by email
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) {
    throw new Error('A user with this email already exists.');
  }

  // ✅ Create new user
  const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
  const hashed = await hashPassword(tempPassword);

  const user = await User.create({
    username: userData.username,
    email: userData.email,
    password: hashed,
    phone: userData.phone,
    referral_id: agentID
  });

  const points = await Points.create({
    referral_id: agentID,
    points: 200,
    created_by: agentID,
    updated_by: agentID
  });

  // ✉️ Send email
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: userData.email,
    subject: 'Your Emergency QR Account Credentials',
    html: `
      <p>Hi <strong>${userData.username}</strong>,</p>
      <p>Here are your account details:</p>
      <p>Email: <strong>${userData.email}</strong></p>
      <p>Temporary Password: <strong>${tempPassword}</strong></p>
      <p>Please log in and change your password immediately.</p>
    `
  });

  // 🔗 Link user to QR
  url.user_id = user.id;
  await url.save();

  return {
    publicurl: { id: url.id, user_id: url.user_id },
    user: { id: user.id, email: user.email, username: user.username },
    points
  };
}



export const getPublicUrlById = async (id, includeInactive = false) => {
  const where = { id };
  if (!includeInactive) where.is_active = true;

  return await Publicurl.findOne({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'phone'],
        include: [
          {
            model: Profile,
            as: 'profiles',
            attributes: ['id', 'docs_name', 'data', 'id_number', 'is_active'],
            where: includeInactive ? {} : { is_active: true },
            required: false,
          }
        ]
      }
    ]
  });
};

export const getPublicUrlByIdEm = async (id, includeInactive = false) => {
  const where = { id };

  if (!includeInactive) {
    where.is_active = true;
    where.status = {
      [Op.in]: ['Paid', 'Active'],
    };
  }

  const publicUrl = await Publicurl.findOne({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'phone'],
        include: [
          {
            model: Profile,
            as: 'profiles',
            attributes: ['id', 'docs_name', 'data', 'id_number', 'is_active'],
            where: includeInactive ? {} : { is_active: true },
            required: false,
          }
        ]
      }
    ]
  });

  return publicUrl;
};

// update publicurl by the id
export async function updatePublicUrl(id, updateData, currentUserId) {
  const existingRecord = await Publicurl.findOne({
    where: { id, is_active: 1 },
  });

  if (!existingRecord) {
    return [0, null];
  }

  //  If user_id already exists, block update
  if (existingRecord.user_id) {
    throw new Error('Already assigned to a user for this QR code.');
  }

  //  Inject user_id if not present
  if (!existingRecord.user_id && currentUserId) {
    updateData.user_id = currentUserId;
  }

  //  Always override status to 'Active'
  updateData.status = 'Active';

  const [count] = await Publicurl.update(updateData, {
    where: { id },
  });

  const updatedRecord = await Publicurl.findOne({ where: { id } });

  return [count, updatedRecord];
}


//change the status- enum values
export async function updatePublicUrlbyuserid(id, updateData) {
  const [count, rows] = await Publicurl.update(updateData, {
    where: { id, is_active: 1 },
    returning: true,
  });
  return [count, rows];
}

export async function updatePublicUrlbyCaptianid(id, updateData) {
  const [count, rows] = await Publicurl.update(updateData, {
    where: { id, is_active: 1 },
    returning: true,
  });
  return [count, rows];
}



export async function deletePublicUrlById(id, force = false, deletedBy = null) {
  if (force) {
    return await Publicurl.destroy({ where: { id } });
  } else {
    const updateData = { is_active: false };
    if (deletedBy) updateData.updated_by = deletedBy;
    const [count] = await Publicurl.update(updateData, { where: { id, is_active: true } });
    return count;
  }
}

export async function deletePublicUrls(force = false, deletedBy = null) {
  const where = {};
  if (!force) where.is_active = true;
  if (force) {
    return await Publicurl.destroy({ where });
  } else {
    const updateData = { is_active: false };
    if (deletedBy) updateData.updated_by = deletedBy;
    const [count] = await Publicurl.update(updateData, { where });
    return count;
  }
}

export async function restorePublicUrlById(id, restoredBy = null) {
  const updateData = { is_active: true };
  if (restoredBy) updateData.updated_by = restoredBy;
  const [count] = await Publicurl.update(updateData, { where: { id, is_active: false } });
  return count;
}

export async function restorePublicUrls(restoredBy = null) {
  const where = { is_active: false };
  const updateData = { is_active: true };
  if (restoredBy) updateData.updated_by = restoredBy;
  const [count] = await Publicurl.update(updateData, { where });
  return count;
}

// QR status
export const getQRCodeSummary = async () => {
  try {
    const [activeCount, inactiveCount] = await Promise.all([
      Publicurl.count({ where: { status: "Active" } }),
      Publicurl.count({ where: { status: "Not Paid" } })
    ]);

    return { activeCount, inactiveCount };
  } catch (error) {
    throw new Error('Error getting QR code summary: ' + error.message);
  }
};

export const getqrbyuserid = async (userId) => {
  try {
    return await Publicurl.findAll({
      where: { user_id: userId, is_active: true },
      attributes: ['id', 'user_id', 'status','captain_id', 'createdAt', 'updatedAt'],
    });
  } catch (error) {
    console.error('Error fetching QR codes by user ID:', error);
    throw error;
  }
};