// services/captain_withdraw.service.js

import { sequelize } from '../../db/index.js';
import { Op } from 'sequelize';
import CaptainWithdrawTransaction from '../models/captainWithdrawTransaction.model.js';
import Captain from '../models/captain_user.models.js';


// Create a new withdraw transaction
export async function createCaptainWithdrawTransactionService(data) {
  const payload = {
    captain_id:     data.captain_id,
    sum_points:     data.sum_points ?? (amount/ point)*sum_points,
    point:          data.point,
    amount:         data.amount,
    payment_status: data.payment_status ?? 'pending',
  };

  return await sequelize.transaction(async (t) => {
    const tx = await CaptainWithdrawTransaction.create(payload, { transaction: t });
    return tx;
  });
}

// Fetch a single transaction by ID (includes soft-deleted if eager)
export async function getCaptainWithdrawTransactionByIdService(id, { paranoid = true } = {}) {
  const tx = await CaptainWithdrawTransaction.findByPk(id, { paranoid });
  if (!tx) {
    throw new Error('CaptainWithdrawTransaction not found');
  }
  return tx;
}

// Update fields of an existing transaction (e.g. status, amount)
export async function updateCaptainWithdrawTransactionService(id, data) {
  const tx = await CaptainWithdrawTransaction.findByPk(id, { paranoid: false });
  if (!tx) {
    throw new Error('CaptainWithdrawTransaction not found');
  }

  await sequelize.transaction(async (t) => {
    // only update provided fields
    for (const key of ['sum_points', 'point', 'amount', 'payment_status']) {
      if (data[key] !== undefined) {
        tx[key] = data[key];
      }
    }
    await tx.save({ transaction: t });
  });

  await tx.reload();
  return tx;
}

// Soft-delete a transaction
export async function deleteCaptainWithdrawTransactionService(id) {
  const tx = await CaptainWithdrawTransaction.findByPk(id);
  if (!tx) {
    throw new Error('CaptainWithdrawTransaction not found');
  }
  await tx.destroy(); // sets deleted_at
  return;
}

// Restore a soft-deleted transaction
export async function restoreCaptainWithdrawTransactionService(id) {
  const tx = await CaptainWithdrawTransaction.findByPk(id, { paranoid: false });
  if (!tx || !tx.deleted_at) {
    throw new Error('CaptainWithdrawTransaction not found or not deleted');
  }
  await tx.restore();
  return tx;
}

// List transactions with optional filters and pagination
export async function getCaptainWithdrawTransactionsService({
  captainId,
  status,
  startDate,
  endDate,
  includeDeleted = false,
  page = 1,
  limit = 10,
} = {}) {
  const where = {};
  if (captainId) where.captain_id = captainId;
  if (status)    where.payment_status = status;
  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) where.created_at[Op.gte] = new Date(startDate);
    if (endDate)   where.created_at[Op.lte] = new Date(endDate);
  }

  const options = {
    where,
    order: [['created_at', 'DESC']],
    offset: (page - 1) * limit,
    limit,
  };
  if (includeDeleted) options.paranoid = false;

  // 1) fetch transactions
  const { rows, count } = await CaptainWithdrawTransaction.findAndCountAll(options);

  // 2) collect unique captain_ids
  const captainIds = [...new Set(rows.map(r => r.captain_id))];
  let captainsMap = {};
  if (captainIds.length) {
    // 3) fetch captain records in one go
    const captains = await Captain.findAll({
      where: { id: captainIds },
      attributes: ['id', 'name', 'email', 'phone'], 
      ...(includeDeleted ? { paranoid: false } : {}),
    });
    // 4) build a map by id
    captainsMap = captains.reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});
  }

  // 5) merge captain data into each transaction row
  const rowsWithCaptain = rows.map(tx => {
    const txJson = tx.toJSON();
    txJson.captain = captainsMap[txJson.captain_id] || null;
    return txJson;
  });

  return {
    rows: rowsWithCaptain,
    count
  };
}

