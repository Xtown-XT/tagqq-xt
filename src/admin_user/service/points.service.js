// src/services/points.service.js

import { Op, fn, col, literal } from 'sequelize';
import Points from '../models/points.models.js';
import Useragent from '../../user_agent/models/user_agent.model.js'
import Partner from '../../user_agent/models/partner.model.js';
import Adminuser from '../../admin_user/models/admin_user.models.js'
import Enduser from '../../endUser/models/user.model.js'

Points.belongsTo(Enduser, { foreignKey: 'referral_id', as: 'referrer' });
Enduser.hasMany(Points, { foreignKey: 'referral_id' });


export const createPoints = async ({ referral_id, points, remarks, createdBy }) => {
  return await Points.create({ referral_id, points, remarks, createdBy });
};

export const getAllPoints = async ({
  includeInactive = false,
  page = 1,
  limit = 10,
  search = '',
  filterType = null,        // 'useragent' | 'adminuser' | 'enduser'
  orderBy = 'points',       // 'points' | 'referral_id' | 'referrer.name'
  order = 'desc',           // 'asc' | 'desc'
  startDate = null,         // e.g. '2025-01-01'
  endDate = null            // e.g. '2025-07-11'
} = {}) => {
  // 1. Build WHERE clause for Points.date filtering
  const pointsWhere = {};
  if (startDate || endDate) {
    pointsWhere.createdAt = {};
    if (startDate) pointsWhere.createdAt[Op.gte] = new Date(startDate);
    if (endDate)   pointsWhere.createdAt[Op.lte] = new Date(endDate);
  }

  // 2. Aggregate sums by referral_id
  const sums = await Points.findAll({
    attributes: [
      'referral_id',
      [ fn('SUM', col('points')), 'points' ]
    ],
    where: pointsWhere,
    paranoid: !includeInactive,
    group: ['referral_id'],
    raw: true
  });

  if (!sums.length) return { data: [], total: 0, page, limit };

  const referralIds = sums.map(r => r.referral_id);

  // 3. Load all possible referrers in parallel
  const [useragents, adminusers, endusers] = await Promise.all([
    Useragent.findAll({
      where: { id: referralIds },
      attributes: ['id', 'useragent_name', 'partner_id'],
      raw: true
    }),
    Adminuser.findAll({
      where: { id: referralIds },
      attributes: ['id', 'admin_username'],
      raw: true
    }),
    Enduser.findAll({
      where: { id: referralIds },
      attributes: ['id', 'username'],
      raw: true
    })
  ]);

  // 4. Load partners for useragents
  const partnerIds = [...new Set(useragents.map(u => u.partner_id))].filter(Boolean);
  const partners = partnerIds.length
    ? await Partner.findAll({
        where: { id: partnerIds },
        attributes: ['id', 'name', 'partner_type'],
        raw: true
      })
    : [];

  // 5. Map sums → enriched records
  let records = sums.map(r => {
    const uid = r.referral_id;
    let referrer = null;

    const ua = useragents.find(u => u.id === uid);
    const ad = adminusers.find(a => a.id === uid);
    const eu = endusers.find(e => e.id === uid);

    if (ua) {
      const p = partners.find(x => x.id === ua.partner_id) || {};
      referrer = {
        id: ua.id,
        name: ua.useragent_name,
        type: 'useragent',
        partner: p.id ? { id: p.id, name: p.name, type: p.partner_type } : null
      };
    } else if (ad) {
      referrer = {
        id: ad.id,
        name: ad.admin_username,
        type: 'adminuser'
      };
    } else if (eu) {
      referrer = {
        id: eu.id,
        name: eu.username,
        type: 'enduser'
      };
    }

    return {
      referral_id: uid,
      points: Number(r.points),
      referrer
    };
  });

  // 6. Apply search & type‐filter in‐memory
  if (search) {
    const q = search.toLowerCase();
    records = records.filter(rec =>
      rec.referrer?.name?.toLowerCase().includes(q)
    );
  }
  if (filterType) {
    records = records.filter(rec =>
      rec.referrer?.type === filterType
    );
  }

  // 7. Sort
  const dir = order.toLowerCase() === 'asc' ? 1 : -1;
  records.sort((a, b) => {
    let av, bv;
    if (orderBy === 'points') {
      av = a.points; bv = b.points;
    } else if (orderBy === 'referral_id') {
      av = a.referral_id; bv = b.referral_id;
    } else if (orderBy === 'referrer.name') {
      av = a.referrer?.name ?? ''; bv = b.referrer?.name ?? '';
    } else {
      // fallback to points
      av = a.points; bv = b.points;
    }
    if (av < bv) return -1 * dir;
    if (av > bv) return  1 * dir;
    return 0;
  });

  // 8. Paginate
  const total  = records.length;
  const offset = (page - 1) * limit;
  const data   = records.slice(offset, offset + limit);

  return { data, total, page, limit };
};




export const getPointsById = async (id, { includeInactive = false } = {}) => {
  const rec = await Points.findByPk(id, {
    paranoid: !includeInactive,
    include: [{ association: 'referrer' }],
  });
  if (!rec) {
    const err = new Error(`Points ${id} not found`);
    err.status = 404;
    throw err;
  }
  return rec;
};

export const getPointsByUserId = async (userId, { includeInactive = false } = {}) => {
  const records = await Points.findAll({
    where: { referral_id: userId },
    paranoid: !includeInactive,
    order: [['createdAt', 'DESC']],
    include: [{ association: 'referrer' }],
  });
  return records;
};

export const updatePointsById = async (id, updates = {}, updatedBy) => {
  const rec = await Points.findByPk(id);
  if (!rec) {
    const err = new Error(`Points ${id} not found`);
    err.status = 404;
    throw err;
  }
  if (updatedBy) updates.updatedBy = updatedBy;
  return await rec.update(updates);
};

export const softDeletePointsById = async (id) => {
  const rec = await Points.findByPk(id);
  if (!rec) {
    const err = new Error(`Points ${id} not found`);
    err.status = 404;
    throw err;
  }
  await rec.destroy();
  return true;
};

export const restorePointsById = async (id) => {
  const rec = await Points.findByPk(id, { paranoid: false });
  if (!rec) {
    const err = new Error(`Points ${id} not found`);
    err.status = 404;
    throw err;
  }
  await rec.restore();
  return rec;
};

export const hardDeletePointsById = async (id) => {
  const rec = await Points.findByPk(id, { paranoid: false });
  if (!rec) {
    const err = new Error(`Points ${id} not found`);
    err.status = 404;
    throw err;
  }
  await rec.destroy({ force: true });
  return true;
};


function getDateRange(daysBack) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - daysBack);
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function resolveReferrer(referral_id) {
  const [enduser, admin, agent] = await Promise.all([
    Enduser.findByPk(referral_id, {
      attributes: ['id', 'username', 'email', 'phone'],
    }),
    Adminuser.findByPk(referral_id, {
      attributes: ['id', 'admin_username', 'admin_email', 'admin_phone'],
    }),
    Useragent.findByPk(referral_id, {
      attributes: ['id', 'useragent_name', 'email', 'phone'],
    }),
  ]);

  if (enduser) {
    return {
      id: enduser.id,
      name: enduser.username,
      email: enduser.email,
      phone: enduser.phone,
      type: 'enduser',
    };
  }

  if (admin) {
    return {
      id: admin.id,
      name: admin.admin_username,
      email: admin.admin_email,
      phone: admin.admin_phone,
      type: 'adminuser',
    };
  }

  if (agent) {
    return {
      id: agent.id,
      name: agent.useragent_name,
      email: agent.email,
      phone: agent.phone,
      type: 'useragent',
    };
  }

  return null;
}

export async function getPointAnalytics() {
  const now = new Date();

  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));
  const lastWeek = getDateRange(7);
  const lastMonth = getDateRange(30);

  async function getTotalAndBestPerformer(start, end) {
    const totalPoints = await Points.sum('points', {
      where: {
        createdAt: { [Op.between]: [start, end] },
        is_active: true,
      },
    });

    const top = await Points.findOne({
      attributes: ['referral_id', [fn('SUM', col('points')), 'total_points']],
      where: {
        createdAt: { [Op.between]: [start, end] },
        is_active: true,
      },
      group: ['referral_id'],
      order: [[literal('total_points'), 'DESC']],
      raw: true,
    });

    const referrerDetails = top
      ? await resolveReferrer(top.referral_id)
      : null;

    return {
      totalPoints: totalPoints || 0,
      bestPerformer: top
        ? {
            referral_id: top.referral_id,
            total_points: Number(top.total_points),
            referrer: referrerDetails,
          }
        : null,
    };
  }

  return {
    today: await getTotalAndBestPerformer(todayStart, todayEnd),
    lastWeek: await getTotalAndBestPerformer(lastWeek.start, lastWeek.end),
    lastMonth: await getTotalAndBestPerformer(lastMonth.start, lastMonth.end),
  };
}