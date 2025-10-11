import nodemailer from 'nodemailer';
import Partner from '../models/partner.model.js';
import Useragent from '../models/user_agent.model.js'
import { Op, Sequelize, fn, col, where, literal } from 'sequelize';
import { hashPassword } from '../../utils/index.js';
import { sequelize } from "../../db/index.js";
import dotenv from 'dotenv';
dotenv.config();

Partner.hasMany(Useragent, {
  foreignKey: 'partner_id',
  as: 'agents', // use 'agents' to reflect one-to-many
});


export async function createPartner(payload) {
  const {
    partner_type, name, address1, address2,
    state, district, country, pincode,
    phone, email, gst_in, udyog_aadhar, rc,
    createdBy, updatedBy
  } = payload;

  console.log('🏁 createPartner called with:', payload);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });

  try {
    return await sequelize.transaction(async (tx) => {
      // Check duplicate by phone or email
      const existingPartner = await Partner.findOne({
        where: { [Op.or]: [{ phone }, { email }] },
        transaction: tx
      });

      if (existingPartner) {
        console.log(`Duplicate partner found with id: ${existingPartner.id}`);
        throw new Error('Partner with this phone or email already exists');
      }

      // Create partner
      const partner = await Partner.create({
        partner_type, name, address1, address2,
        state, district, country, pincode,
        phone, email, gst_in, udyog_aadhar, rc,
        createdBy, updatedBy
      }, { transaction: tx });

      console.log('Partner created with id:', partner.id);

      // Create useragent for partner admin
      const generatedPassword = await hashPassword(partner.phone);
      const useragent = await Useragent.create({
        useragent_name: partner.name,
        email: partner.email,
        phone: partner.phone,
        role: 'Admin',
        partner_id: partner.id,
        is_active: true,
        password: generatedPassword
      }, { transaction: tx });

      console.log('Useragent created:', useragent.toJSON());

      // Send email (fire and forget, no await)
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: useragent.email,
        subject: 'Your Agent Account Has Been Created',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <p>Hello <strong>${useragent.useragent_name}</strong>,</p>
            <p>Your account on <strong>OurApp</strong> has been set up. Here are your login credentials:</p>
            <ul>
              <li><strong>Email:</strong> ${useragent.email}</li>
              <li><strong>Password:</strong> ${partner.phone}</li>
            </ul>
            <p>Please log in and change your password as soon as possible.</p>
            <p>If you have any questions, feel free to reach out.</p>
            <p>Best regards,<br>The <strong>Tagqq</strong> Team</p>
            <p>Need help? Contact us at support@tagqq.in</p>
          </div>
        `.trim()
      };

      transporter.sendMail(mailOptions)
        .then(info => console.log('✉️ Email sent:', info.messageId))
        .catch(err => console.error('❌ Email error:', err));

      return { partner, useragent };
    });
  } catch (error) {
    console.error('createPartner failed:', error);
    throw error;
  }
}



//getall
export async function getPartners({
  userAgent     = null,
  isAdmin       = false,
  includeInactive = false,
  is_active,
  partner_type,
  search,
  startDate = null,
  endDate = null,
  page     = 1,
  limit    = 10,
  orderBy  = 'createdAt',
  order    = 'asc',
  isMaster = false,     
} = {}) {
  const where = {};

  // 1) role‑based partner scoping (unchanged)
  if (!isAdmin && userAgent?.id) {
    const agent = await Useragent.findByPk(userAgent.id);
    if (agent?.partner_id) {
      where.id = agent.partner_id;
    } else {
      return { rows: [], count: 0 };
    }
  }

  // 
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

  // 2) ACTIVE/INACTIVE filters — only if NOT master
  if (!isMaster) {
    if (!includeInactive)      where.is_active = true;
    if (typeof is_active === 'boolean') where.is_active = is_active;
  }

  // 3) TYPE filter
  if (partner_type) where.partner_type = partner_type;

  // 4) SEARCH filter
  if (search) {
    where[Op.or] = [
      { name:     { [Op.like]: `%${search}%` } },
      { address1: { [Op.like]: `%${search}%` } },
      { email:    { [Op.like]: `%${search}%` } },
      { phone:    { [Op.like]: `%${search}%` } },
    ];
  }
 
  // 5) ORDER clause
  const orderClause = [[orderBy, order.toUpperCase()]];

  const include = [
  {
    model: Useragent,
    as: 'agents', 
  }
];

  if (isMaster) {
    // no pagination: return all matching partners
    const rows = await Partner.findAll({ where, order: orderClause,include });
    return { rows, count: rows.length };
  } else {
    // paginated path
    const offset = (page - 1) * limit;
    const { rows, count } = await Partner.findAndCountAll({
      where,
      offset,
      limit,
      order: orderClause,
      include,
    });
    return { rows, count };
  }
}

// Get Partners
export async function getPartnerTypes({
  partner_type,
  search,
  startDate,
  endDate,
  page = 1,
  limit = 10,
  orderBy = 'partner_type',
  order = 'ASC',
  isMaster = false,
  includeInactive = false,
  is_active,
  userAgent,
  isAdmin = false
} = {}) {
  const offset = (page - 1) * limit;
  const where = {};

  if (!isAdmin && userAgent?.id) {
    const agent = await Useragent.findByPk(userAgent.id);
    if (agent?.partner_id) {
      where.id = agent.partner_id;
    } else {
      return { rows: [], count: 0 };
    }
  }

  if (!isMaster) {
    if (!includeInactive) {
      where.is_active = true;
    }
    if (typeof is_active === 'boolean') {
      where.is_active = is_active;
    }
  }

  if (partner_type) {
    where.partner_type = partner_type;
  }

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }
  // 
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

  const allowedOrderFields = ['partner_type', 'partner_count'];
  const safeOrderBy = allowedOrderFields.includes(orderBy) ? orderBy : 'partner_type';
  const safeOrderDir = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const orderClause =
    safeOrderBy === 'partner_count'
      ? [literal('partner_count'), safeOrderDir]
      : [['partner_type', safeOrderDir]];

  const result = await Partner.findAll({
    attributes: [
      'partner_type',
      [fn('COUNT', col('id')), 'partner_count']
    ],
    where,
    group: ['partner_type'],
    order: [orderClause],
    raw: true
  });

  return {
    rows: result,
    count: result.length
  };
}



export async function getPartnerById(id, includeInactive = false) {
  const where = { id };
  if (!includeInactive) where.is_active = true;
  try {
    return await Partner.findOne({ where });
  } catch (err) {
    console.error(`❌ Error fetching Partner by ID=${id}:`, err);
    throw err;
  }
}

export async function updatePartner(id, updateData) {
  try {
    const [count, rows] = await Partner.update(updateData, {
      where: { id, is_active: true },
      returning: true,
    });
    console.log(`🔄 Partner update count for ID=${id}: ${count}`);
    return [count, rows];
  } catch (err) {
    console.error(`❌ Error updating Partner ID=${id}:`, err);
    throw err;
  }
}

export async function deletePartnerById(id, force = false, deletedBy = null) {
  if (force) {
    try {
      return await Partner.destroy({ where: { id } });
    } catch (err) {
      console.error(`❌ Error force-deleting Partner ID=${id}:`, err);
      throw err;
    }
  } else {
    const updateData = { is_active: false };
    if (deletedBy) updateData.updatedBy = deletedBy;
    try {
      const [count] = await Partner.update(updateData, { where: { id, is_active: true } });
      console.log(`🗑️ Soft-deleted Partner ID=${id}`);
      return count;
    } catch (err) {
      console.error(`❌ Error soft-deleting Partner ID=${id}:`, err);
      throw err;
    }
  }
}

export async function deletePartners(force = false, deletedBy = null) {
  const where = {};
  if (!force) where.is_active = true;

  if (force) {
    try {
      return await Partner.destroy({ where });
    } catch (err) {
      console.error('❌ Error force-deleting multiple Partners:', err);
      throw err;
    }
  } else {
    const updateData = { is_active: false };
    if (deletedBy) updateData.updatedBy = deletedBy;
    try {
      const [count] = await Partner.update(updateData, { where });
      console.log(`🗑️ Soft-deleted ${count} Partners`);
      return count;
    } catch (err) {
      console.error('❌ Error soft-deleting multiple Partners:', err);
      throw err;
    }
  }
}

export async function restorePartnerById(id, restoredBy = null) {
  const updateData = { is_active: true };
  if (restoredBy) updateData.updatedBy = restoredBy;
  try {
    const [count] = await Partner.update(updateData, { where: { id, is_active: false } });
    console.log(`♻️ Restored Partner ID=${id}`);
    return count;
  } catch (err) {
    console.error(`❌ Error restoring Partner ID=${id}:`, err);
    throw err;
  }
}

export async function restorePartners(restoredBy = null) {
  const where = { is_active: false };
  const updateData = { is_active: true };
  if (restoredBy) updateData.updatedBy = restoredBy;
  try {
    const [count] = await Partner.update(updateData, { where });
    console.log(`♻️ Restored ${count} Partners`);
    return count;
  } catch (err) {
    console.error('❌ Error restoring multiple Partners:', err);
    throw err;
  }
}
