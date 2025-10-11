// services/order.service.js

import { sequelize } from '../../db/index.js';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Orders, Qrcode, User_Agent } from '../models/index.js';
import public_url from '../../endUser/models/public_url.model.js'
import Partner from '../models/partner.model.js'
import User from '../../endUser/models/user.model.js'
import Adminuser from '../../admin_user/models/admin_user.models.js';


if (!Orders.associations?.partner) {
  Orders.belongsTo(Partner, {
    foreignKey: 'partner_id',
    as: 'partner',
  });
}
if (!Partner.associations?.orders) {
  Partner.hasMany(Orders, {
    foreignKey: 'partner_id',
    as: 'orders',
  });
}

if (!Orders.associations?.Adminuser) {
  Orders.belongsTo(Adminuser, {
    foreignKey: 'admin_id',
    as: 'admin',
  });
}

if (!Adminuser.associations?.orders) {
  Adminuser.hasMany(Orders, {
    foreignKey: 'admin_id',
    as: 'orders',
  });
}

// Order → User_Agent
if (!Orders.associations?.user_agent) {
  Orders.belongsTo(User_Agent, {
    foreignKey: 'order_by',
    as: 'user_agent',
  });
}
if (!User_Agent.associations?.orders) {
  User_Agent.hasMany(Orders, {
    foreignKey: 'order_by',
    as: 'orders',
  });
}
Orders.hasMany(public_url, {
  as: 'public_urls',
  foreignKey: 'order_id',
});
public_url.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'end_user'  // renamed alias
});


User.hasMany(public_url, {
  foreignKey: 'user_id'
});

async function generateOrderCode() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const count = await Orders.count({
    where: {
      createdAt: {
        [Op.between]: [todayStart, todayEnd]
      }
    }
  });
  const sequence = String(count + 1).padStart(4, '0');
  return `ORD-${datePart}-${sequence}`;
}

export async function createOrderService(data, agentUserInput, adminUserInput = null) {
  // 1) Normalize agent user ID (if provided)
  const agentUserId =
    typeof agentUserInput === 'object' && agentUserInput !== null && 'id' in agentUserInput
      ? agentUserInput.id
      : agentUserInput;

  // 2) Normalize admin user ID (for hub QR generation)
  const adminUserId =
    typeof adminUserInput === 'object' && adminUserInput !== null && 'id' in adminUserInput
      ? adminUserInput.id
      : adminUserInput;

  // 3) Decide who “creates” the order: agent preferred, otherwise admin
  const createdBy = agentUserId || adminUserId;
  if (!createdBy) {
    throw new Error('Neither agent nor admin user ID was provided');
  }

  // 4) If we have an agent, fetch its partner; otherwise treat as a hub order (no partner)
  let partnerId = null;
  if (agentUserId) {
    const agent = await User_Agent.findByPk(agentUserId);
    if (!agent) throw new Error('Invalid agent user');
    partnerId = agent.partner_id;
  }

  // 5) Generate order code
  const orderCode = await generateOrderCode();

  const orderPayload = {
    order_code: orderCode,
    no_of_qr_ordered: data.no_of_qr_ordered,
    view: false,
    partner_id: partnerId,
    order_by: createdBy,
    admin_id: adminUserId || null,
    status: data.status || 'processing',
    createdBy,
    updatedBy: createdBy
  };
  console.log('Order Payload:', orderPayload);

  // 6) Wrap in transaction for atomicity
  return await sequelize.transaction(async (t) => {
    const newOrder = await Orders.create(orderPayload, { transaction: t });

    const qrPayload = [];
    for (let i = 1; i <= data.no_of_qr_ordered; i++) {
      qrPayload.push({
        id: uuidv4(),
        status: 'Not Paid',
        order_id: newOrder.id,
        createdBy,
        updatedBy: createdBy,
        qr_code: `${orderCode}-${String(i).padStart(4, '0')}`
      });
    }

    // 7) Bulk‑insert all QR records (replace `public_url` with your actual QR model)
    await public_url.bulkCreate(qrPayload, { transaction: t });

    return newOrder;
  });
}



export async function getOrderByIdService(id) {
  const order = await Orders.findByPk(id);
  if (!order || !order.is_active) throw new Error('Order not found');
  return order;
}

export async function updateOrderService(id, data, userId) {
  // 1) Load order
  const order = await Orders.findByPk(id);
  if (!order || !order.is_active) {
    throw new Error("Order not found or inactive");
  }

  console.log(
    "BEFORE UPDATE:",
    "ordered=",
    order.no_of_qr_ordered,
    "→ incoming=",
    data.no_of_qr_ordered
  );

  await sequelize.transaction(async (t) => {
    // 2) Detect QR‐count change & effective status
    const changingQrCount =
      data.no_of_qr_ordered != null &&
      data.no_of_qr_ordered !== order.no_of_qr_ordered;

    const effectiveStatus = data.status ?? order.status;

    // 3) Prevent QR changes once not in “processing”
    if (changingQrCount && effectiveStatus !== "processing") {
      throw new Error(
        `Cannot change QR count when status is "${effectiveStatus}".`
      );
    }

    // 4) Update status if requested
    if (data.status && data.status !== order.status) {
      order.status = data.status;
      console.log("Status updated to:", order.status);
    }

    // 5) Handle QR code creation or deletion
    if (changingQrCount) {
      const oldCount = order.no_of_qr_ordered;
      const newCount = data.no_of_qr_ordered;
      const delta = newCount - oldCount;

      if (delta > 0) {
        // Create additional QR records
        const qrPayload = [];
        for (let i = oldCount + 1; i <= newCount; i++) {
          qrPayload.push({
            id: uuidv4(),
            status: "Not Paid",
            order_id: order.id,
            createdBy: userId,
            updatedBy: userId,
            qr_code: `${order.order_code}-${String(i).padStart(4, "0")}`,
          });
        }
        console.log("Creating", qrPayload.length, "QR codes...");
        await public_url.bulkCreate(qrPayload, { transaction: t });
      } else {
        // Remove excess unpaid QR records
        const toDelete = await public_url.findAll({
          where: { order_id: order.id, status: "Not Paid" },
          order: [["createdAt", "DESC"]],
          limit: Math.abs(delta),
          transaction: t,
        });

        const idsToDelete = toDelete.map((qr) => qr.id);
        if (idsToDelete.length !== Math.abs(delta)) {
          throw new Error(
            `Found only ${idsToDelete.length} unpaid QR codes to delete; expected ${Math.abs(
              delta
            )}.`
          );
        }
        console.log("Deleting QR IDs:", idsToDelete);
        await public_url.destroy({
          where: { id: idsToDelete },
          transaction: t,
        });
      }

      order.no_of_qr_ordered = data.no_of_qr_ordered;
    }

    // 6) Handle view & view_time
    const isViewingNow = data.view === true && order.view === false;
    if (typeof data.view === "boolean") {
      order.view = data.view;
    }
    if (isViewingNow) {
      order.view_time = new Date();
    }

    // 7) Apply any other updatable fields
    for (const [key, value] of Object.entries(data)) {
      if (
        !["status", "no_of_qr_ordered", "view", "view_time"].includes(key) &&
        value != null &&
        Object.prototype.hasOwnProperty.call(order, key)
      ) {
        order[key] = value;
      }
    }

    // 8) Audit & save
    order.updatedBy = userId;
    await order.save({ transaction: t });
  });

  // 9) Reload and return fresh data
  await order.reload();
  return order;
}

export async function deleteOrderService(id, userId) {
  const order = await Orders.findByPk(id);
  if (!order || !order.is_active) throw new Error('Order not found');
  order.is_active = false;
  order.updatedBy = userId;
  await order.save();
  return;
}

export async function restoreOrderService(id, userId) {
  const order = await Orders.findByPk(id, { paranoid: false });
  if (!order || order.is_active) throw new Error('Order not found or already active');
  order.is_active = true;
  order.updatedBy = userId;
  await order.save();
  return order;
}


export async function getOrders({
  includeInactive = false,
  is_active,
  status,
  partner_id,
  order_by,
  search,
  startDate,
  endDate,
  page,
  view,
  limit,
  foradmin = false,
  foruseragent = false,
  orderBy = 'createdAt',
  order = 'asc',
  userAgent = null,
  isAdmin = false,
  is_master = false,
} = {}) {
  const where = {};

  // 1. Role-based scoping
  if (!isAdmin && userAgent?.id) {
    const agent = await User_Agent.findByPk(userAgent.id);
    if (!agent?.partner_id) {
      console.warn('User agent has no partner_id:', userAgent.id);
      return { rows: [], count: 0 };
    }
    where.partner_id = agent.partner_id;
  } else if (isAdmin && partner_id) {
    where.partner_id = partner_id;
  }

  // 2. Date filtering
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.createdAt[Op.lt] = nextDay;
    }
  }

  if (foradmin) {
    where.partner_id = null;
  }
  if (foruseragent) {
    where.partner_id = { [Op.not]: null };
  }

  // 3. Status and is_active filtering
  if (!is_master) {
    if (!includeInactive) where.is_active = true;
    if (typeof is_active === 'boolean') where.is_active = is_active;
  } else {
    if (typeof is_active === 'boolean') {
      where.is_active = is_active;
    }
  }

  if (status) {
    where.status = Array.isArray(status) ? { [Op.in]: status } : status;
  }

  if (partner_id) where.partner_id = partner_id;
  if (order_by) where.order_by = order_by;

  // 4. Boolean casting for view
  if (typeof view === 'string') {
    const v = view.toLowerCase();
    if (v === 'true') view = true;
    else if (v === 'false') view = false;
    else view = 'all';
  }

  if (view === true || view === false) {
    where.view = view;
  }

  // 5. Search logic
  if (search) {
    where[Op.or] = [
      { order_code: { [Op.like]: `%${search}%` } },
      { '$partner.name$': { [Op.like]: `%${search}%` } },
      { '$partner.partner_type$': { [Op.like]: `%${search}%` } },
      { status: { [Op.like]: `%${search}%` } },
    ];
  }

  // 6. Include config
  const include = [
    {
      model: Partner,
      as: 'partner',
    },
    {
      model: Adminuser,
      as: 'admin',
    },
    {
      model: User_Agent,
      as: 'user_agent',
      attributes: ['id', 'useragent_name', 'email', 'phone', 'role', 'partner_id'],
    },
    {
      model: public_url,
      as: 'public_urls',
      attributes: ['id', 'order_id', 'user_id', 'status', 'createdAt'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone'],
        }
      ]
    }
  ];


  const orderClause = [[orderBy, order.toUpperCase()]];
  const offset = page && limit ? (page - 1) * limit : undefined;
  const limitVal = page && limit ? limit : undefined;

  try {
    // 7. Master can fetch all rows without pagination
    if (is_master) {
      const rows = await Orders.findAll({
        where,
        order: orderClause,
        include,
        distinct: true,
      });

      const count = await Orders.count({
        where,
        distinct: true,
        col: 'id',
        include: [
          {
            model: Partner,
            as: 'partner',
          },
          {
            model: User_Agent,
            as: 'user_agent',
          },
        ],
      });

      return { rows, count };
    }


    // 8. Others get paginated results
    // 1. Get actual rows (with full includes like public_urls)
    const rows = await Orders.findAll({
      // subQuery: false,
      where,
      offset,
      limit: limitVal,
      order: orderClause,
      include,
      distinct: true,
    });

    // 2. Count distinct Orders by ID (exclude hasMany to prevent duplication)
    const count = await Orders.count({
      where,
      distinct: true,
      col: 'id', // use the correct table alias if needed
      include: [
        {
          model: Partner,
          as: 'partner',
        },
        {
          model: User_Agent,
          as: 'user_agent',
        },
        //  Do not include `public_urls` here to avoid inflated count
      ]
    });

    return { rows, count };

  } catch (err) {
    console.error('Sequelize error in getOrders():', err);
    throw err;
  }
}