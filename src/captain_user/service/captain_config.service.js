import { sequelize } from '../../db/index.js';
import { Op } from 'sequelize';
import Captainconfig from '../models/captain_config.models.js';
import AdminUser from '../../admin_user/models/admin_user.models.js';
import CaptainUser from '../models/captain_user.models.js';

if (!Captainconfig.associations?.creator) {
  Captainconfig.belongsTo(AdminUser, {
    foreignKey: 'created_by',
    targetKey: 'id',
    as: 'creator'
  });
}

if (!Captainconfig.associations?.updater) {
  Captainconfig.belongsTo(AdminUser, {
    foreignKey: 'updated_by',
    targetKey: 'id',
    as: 'updater'
  });
}

if (!Captainconfig.associations?.captain) {
  Captainconfig.belongsTo(CaptainUser, {
    foreignKey: 'captain_id', // make sure this field exists in captain_config table
    targetKey: 'id',
    as: 'captain'
  });
}

// Create a new Captainconfig record
export async function createCaptainConfigService(data, userId) {
  const payload = {
    target: data.target,
    point_per_sale: data.point_per_sale,
    point_per_rupee: data.point_per_rupee,
    bonus_percent: data.bonus_percent,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    created_by: userId,
    updated_by: userId,
  };

  return await sequelize.transaction(async (t) => {
    const newConfig = await Captainconfig.create(payload, { transaction: t });
    return newConfig;
  });
}

// Fetch a single config by ID
export async function getCaptainConfigByIdService(id) {
  const config = await Captainconfig.findByPk(id);
  if (!config) {
    throw new Error('Captainconfig not found');
  }
  return config;
}

// Update an existing config
export async function updateCaptainConfigService(id, data, userId) {
  const config = await Captainconfig.findByPk(id, { paranoid: false });
  if (!config) {
    throw new Error('Captainconfig not found');
  }

  await sequelize.transaction(async (t) => {
    // only update fields provided
    for (const key of ['target', 'point_per_sale', 'point_per_rupee', 'bonus_percent', 'start_date', 'end_date']) {
      if (data[key] !== undefined) {
        config[key] = data[key];
      }
    }
    config.updated_by = userId;
    await config.save({ transaction: t });
  });

  await config.reload();
  return config;
}

// Soft-delete a config
export async function deleteCaptainConfigService(id, userId) {
  const config = await Captainconfig.findByPk(id);
  if (!config) {
    throw new Error('Captainconfig not found');
  }
  config.updated_by = userId;
  await config.destroy();  // paranoid: true -> sets deletedAt
  return;
}

// Restore a soft-deleted config
export async function restoreCaptainConfigService(id, userId) {
  const config = await Captainconfig.findByPk(id, { paranoid: false });
  if (!config || !config.deletedAt) {
    throw new Error('Captainconfig not found or not deleted');
  }
  config.updated_by = userId;
  await config.restore();
  return config;
}

// List configs with optional filters and pagination
export async function getCaptainConfigsService({
  includeDeleted = false,
  startDate,
  endDate,
  page = 1,
  limit = 20,
  onlyLatest = false,
  skipPagination = false,
  isMaster = false
} = {}) {
  const where = {};

  const offsetMinutes = new Date().getTimezoneOffset();

  if (startDate || endDate) {
  where.createdAt = {};

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    start.setMinutes(start.getMinutes() - offsetMinutes);
    where.createdAt[Op.gte] = start;
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    end.setMinutes(end.getMinutes() - offsetMinutes);
    where.createdAt[Op.lte] = end;
  }
}

  const options = {
    where,
    order: [['createdAt', 'DESC']],
    include: [
      { model: AdminUser, as: 'creator', attributes: ['id', 'admin_username'] },
      { model: AdminUser, as: 'updater', attributes: ['id', 'admin_username'] },
      { model: CaptainUser, as: 'captain', attributes: ['id', 'name'] }
    ],
    paranoid: !isMaster
  };

  if (includeDeleted) options.paranoid = false;

  if (onlyLatest) {
    options.limit = 1;
    options.offset = 0;
    const latestEntry = await Captainconfig.findAll(options);
    return { rows: latestEntry, count: latestEntry.length };
  }

  if (!skipPagination) {
    options.limit = limit;
    options.offset = (page - 1) * limit;
    const { rows, count } = await Captainconfig.findAndCountAll(options);
    return { rows, count };
  } else {
    const allRows = await Captainconfig.findAll(options);
    return { rows: allRows, count: allRows.length };
  }
}

export async function getlatestCaptainConfigService() {
  const latestConfig = await Captainconfig.findOne({
    order: [['createdAt', 'DESC']],
  });

  if (!latestConfig) {
    throw new Error('No Captainconfig found');
  }

  return latestConfig;
}