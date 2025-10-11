import CaptainTransaction from "../models/captainTransactionModel.js";
import CaptainWithdrawTransaction from "../models/captainWithdrawTransaction.model.js";
import Captainconfig from "../models/captain_config.models.js";
import Captainuser from "../models/captain_user.models.js";
import AdminUser from '../../admin_user/models/admin_user.models.js';
import User from "../../endUser/models/user.model.js";
import Publicurl from "../../endUser/models/public_url.model.js";
import * as CaptainTransactionDto from "../dto/captainTransactiondto.js";
import { Op, fn, col, where, literal } from "sequelize";
import { startOfDay, endOfDay } from 'date-fns';
import { z } from "zod";

CaptainTransaction.belongsTo(Captainuser, {
  foreignKey: "captain_id",
  as: "captain",
});

CaptainTransaction.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

CaptainTransaction.belongsTo(Publicurl, {
  foreignKey: "public_url_id",
  as: "public_url",
});

class CaptainTransactionService {
  // Create a single transaction
  static async create(data) {
    const validated =
      CaptainTransactionDto.createCaptainTransactionSchema.parse(data);
    return await CaptainTransaction.create(validated);
  }

  // Bulk create transactions
  static async bulkCreate(dataArray) {
    const validated =
      CaptainTransactionDto.bulkCreateCaptainTransactionSchema.parse(dataArray);
    return await CaptainTransaction.bulkCreate(validated);
  }

  // Get all with filters and pagination
  static async getAll(params = {}) {
    const validated = CaptainTransactionDto.getCaptainTransactionListSchema.parse(params);
    const {
      search,
      startDate,
      endDate,
      sort_by,
      order,
      limit,
      page,
      captain_id,
      user_id,
      status,
      is_master = false
    } = validated;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { public_url_id: { [Op.like]: `%${search}%` } },
        { status: { [Op.like]: `%${search}%` } },
        !isNaN(Number(search)) ? { points: Number(search) } : null,
      ].filter(Boolean);
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // set to 00:00:00.000
        where.created_at[Op.gte] = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // set to 23:59:59.999
        where.created_at[Op.lte] = end;
      }
    }

    console.log('FILTER WHERE:', where);


    if (captain_id) where.captain_id = captain_id;
    if (user_id) where.user_id = user_id;
    if (status) where.status = status;

    // Define options object first
    const options = {
      where,
      order: sort_by ? [[sort_by, order]] : [["created_at", "DESC"]],
      paranoid: !(is_master === true || is_master === 'true'),

      include: [
        {
          model: Captainuser,
          as: "captain",
          attributes: ["id", "name", "phone", "email"],
          required: false,
          paranoid: false
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "phone"],
          required: false,
          paranoid: false
        },
        {
          model: Publicurl,
          as: "public_url",
          attributes: ["id", "status"],
          required: false,
          paranoid: false
        }
      ]
    };

    // Add pagination only if is_master is false
    if (!(is_master === true || is_master === 'true')) {
      options.limit = limit;
      options.offset = offset;
    }

    const { count, rows } = await CaptainTransaction.findAndCountAll(options);

    return {
      total: count,
      page: is_master ? 1 : page,
      perPage: is_master ? count : limit,
      totalPages: is_master ? 1 : Math.ceil(count / limit),
      data: rows,
    };
  }


static async getTodayWithdraw(user, captain_id) {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  // ✅ 1. Validate user presence
  if (!user || !user.id) {
    throw new Error('Unauthorized: User information missing.');
  }

  // ✅ 2. Verify if user is admin or captain
  const [admin, captainUser] = await Promise.all([
    AdminUser.findByPk(user.id),
    Captainuser.findByPk(user.id),
  ]);

  if (!admin && !captainUser) {
    throw new Error('Access denied: Only admin or captain can view withdraw details.');
  }

  // ✅ 3. Set role dynamically
  if (!user.role) {
    user.role = admin ? 'admin' : 'captain';
  }

  // ✅ 4. Admin → Fetch all captains | Captain → Only self
  if (user.role === 'captain') {
    // Captain can only view their own details
    return [await this.calculateCaptainWithdraw(user.id, todayStart, todayEnd)];
  }

  // ✅ 5. If Admin, fetch all captains (or specific captain if query param given)
  const whereCondition = captain_id ? { id: captain_id } : {}; 
  const captains = await Captainuser.findAll({ where: whereCondition });

  if (!captains.length) throw new Error('No captains found.');

  // ✅ 6. Calculate withdraw for each captain
  const withdrawDetails = await Promise.all(
    captains.map((captain) => this.calculateCaptainWithdraw(captain.id, todayStart, todayEnd))
  );

  return withdrawDetails;
}

// ✅ Helper function to calculate a single captain’s withdraw details
static async calculateCaptainWithdraw(captain_id, todayStart, todayEnd) {
  const captain = await Captainuser.findByPk(captain_id);
  if (!captain) throw new Error('Captain not found');

  const todayTransactions = await CaptainTransaction.findAll({
    where: {
      captain_id,
      created_at: { [Op.between]: [todayStart, todayEnd] },
    },
  });

  const todaySaleCount = todayTransactions.length;
  const todaySaleAmount = todayTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

  const dailyTarget = captain.daily_target_amount || 0;
  const pendingTarget = dailyTarget > todaySaleAmount ? dailyTarget - todaySaleAmount : 0;
  const isTargetCompleted = todaySaleAmount >= dailyTarget;
  const bonusAmount = isTargetCompleted ? (captain.bonus_amount || 0) : 0;

  const todayWithdrawAmount = todaySaleAmount + bonusAmount;

  const alreadyWithdrawn = await CaptainWithdrawTransaction.sum('amount', {
    where: {
      captain_id,
      payment_status: 'completed',
      created_at: { [Op.between]: [todayStart, todayEnd] },
    },
  });

  const remainingWithdrawable = todayWithdrawAmount - (alreadyWithdrawn || 0);

  return {
    captainName: captain.name,
    todaySaleCount,
    todaySaleAmount,
    pendingTarget,
    bonusAmount,
    todayWithdrawAmount,
    alreadyWithdrawn: alreadyWithdrawn || 0,
    remainingWithdrawable: remainingWithdrawable < 0 ? 0 : remainingWithdrawable,
  };
}


  // Get one by ID
  static async getById(params) {
    const { id } =
      CaptainTransactionDto.getCaptainTransactionByIdSchema.parse(params);
    return await CaptainTransaction.findByPk(id);
  }

  // Update single
  static async update(id, data) {
    CaptainTransactionDto.updateCaptainTransactionSchema.parse({ id, ...data });
    const tx = await CaptainTransaction.findByPk(id);
    if (!tx) throw new Error("Transaction not found");
    return await tx.update(data);
  }

  // Bulk update
  static async bulkUpdate(updateArray) {
    const validated =
      CaptainTransactionDto.bulkUpdateCaptainTransactionSchema.parse(
        updateArray
      );
    const results = [];

    for (const { id, ...rest } of validated) {
      const tx = await CaptainTransaction.findByPk(id);
      if (tx) {
        results.push(await tx.update(rest));
      }
    }

    return results;
  }

  // Soft delete
  static async delete(params) {
    const { id } =
      CaptainTransactionDto.deleteCaptainTransactionSchema.parse(params);
    const tx = await CaptainTransaction.findByPk(id);
    if (!tx) throw new Error("Transaction not found");
    return await tx.destroy();
  }

  // Bulk delete
  static async bulkDelete(params) {
    const { ids } =
      CaptainTransactionDto.bulkDeleteCaptainTransactionSchema.parse(params);
    return await CaptainTransaction.destroy({
      where: { id: { [Op.in]: ids } },
    });
  }

  // Restore a soft-deleted record
  static async restore(params) {
    const { id } =
      CaptainTransactionDto.restoreCaptainTransactionSchema.parse(params);
    const tx = await CaptainTransaction.findOne({
      where: { id },
      paranoid: false,
    });
    if (!tx) throw new Error("Transaction not found");
    return await tx.restore();
  }

  // Bulk restore
  static async bulkRestore(params) {
    const { ids } =
      CaptainTransactionDto.bulkDeleteCaptainTransactionSchema.parse(params);
    const restored = [];

    for (const id of ids) {
      const tx = await CaptainTransaction.findOne({
        where: { id },
        paranoid: false,
      });
      if (tx?.deleted_at) {
        await tx.restore();
        restored.push(tx);
      }
    }

    return restored;
  }

  // Inside CaptainTransactionService class
  static async calculateWithdrawForCaptain(captain_id) {
    const transactions = await CaptainTransaction.findAll({
      where: {
        captain_id,
        status: 'not_yet_redeemed'
      },
      raw: true
    });

    if (!transactions.length) return [];

    // Group transactions by date safely
    const transactionsByDate = {}

    for (const tx of transactions) {
      const createdAt = tx.created_at || tx.createdAt;

      // Validate date
      const parsedDate = new Date(createdAt);
      if (!createdAt || isNaN(parsedDate)) {
        console.warn('Skipping transaction with invalid created_at:', tx.id);
        continue;
      }

      const date = parsedDate.toISOString().split('T')[0];

      if (!transactionsByDate[date]) transactionsByDate[date] = [];
      transactionsByDate[date].push(tx);
    }

    // Get latest config for the captain
    const config = await Captainconfig.findOne({
      where: { created_by: captain_id }, 
      order: [['createdAt', 'DESC']],
      raw: true
    });

    if (!config) {
      console.warn('No config found for captain:', captain_id);
      return [];
    }

    const results = [];

    // Evaluate each day's transaction count
    for (const [date, txList] of Object.entries(transactionsByDate)) {
      const txnCount = txList.length;
      const amountSum = txList.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      if (txnCount >= config.target) {
        const bonus = (amountSum * config.bonus_percent) / 100;
        const totalWithBonus = amountSum + bonus;

        results.push({
          date,
          captain_id,
          transaction_count: txnCount,
          base_amount: amountSum,
          bonus,
          total_with_bonus: totalWithBonus,
          target: config.target
        });
      }
    }

    return results;
  }

}

export default CaptainTransactionService;
