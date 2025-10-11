import OrderTracking from '../models/order_traking.models.js';
import Payment from '../../thridPartyAPI/models/payment.js';
import { sequelize } from '../../db/index.js';
import User from '../models/user.model.js';
import { fn, col, Op } from 'sequelize';
import Delivery_address from '../models/delivery_address.model.js';

// import { Sequelize } from 'sequelize'; // Ensure Sequelize is imported if not already
OrderTracking.belongsTo(Payment, {
  foreignKey: 'payment_id',
  as: 'payment',
  onDelete: 'SET NULL',
});

OrderTracking.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE'
});

OrderTracking.belongsTo(Delivery_address, {
  foreignKey: 'delivery_address_id',
  as: 'delivery',
  onDelete: 'CASCADE'
});
export async function createOrderTracking({ payment_id, status = 'Processing', user_id, delivery_address_id }) {
  try {
    const record = await OrderTracking.create({ payment_id, status, user_id, delivery_address_id });
    console.log(`OrderTracking created: ${record.id}`);
    return record;
  } catch (err) {
    console.error('Error creating OrderTracking:', err);
    throw err;
  }
}

export async function createOrderTrackingforrazerpay(
  { payment_id, status = 'Processing', user_id, is_active = true, delivery_address_id },
  options = {}
) {
  const existing = await OrderTracking.findOne({
    where: { payment_id },
    ...options
  });

  if (existing) {
    console.log(`⏭️  Skipping create: OrderTracking already exists for payment_id=${payment_id}`);
    return existing;
  }

  const record = await OrderTracking.create(
    { payment_id, status, user_id, is_active, delivery_address_id },
    options
  );
  console.log(`✅ OrderTracking created: ${record.id}`);
  return record;
}


export async function getOrderTrackings({
  page = 1,
  limit = 10,
  status,
  user_id,
  payment_id,
  orderBy = 'createdAt',
  order = 'ASC',

  currentUser = null,
  isAdmin = false,
} = {}) {
  const where = {};

  // Apply filters
  if (status) where.status = status;
  if (payment_id) where.payment_id = payment_id;

  // Role-based filter logic
  if (!isAdmin) {
    if (currentUser) {
      where.user_id = currentUser.id;
    } else {
      // neither admin nor user — deny access
      return { count: 0, rows: [] };
    }
  } else if (user_id) {
    // Admins can optionally filter by user_id
    where.user_id = user_id;
  }

  const offset = (page - 1) * limit;

  try {
    const result = await OrderTracking.findAndCountAll({
      where,
      offset,
      limit,
      order: [[orderBy, order]],
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email', 'phone'] },
        {
          model: Delivery_address,
          as: 'delivery',
          attributes: ['address1', 'address2', 'district', 'state', 'country', 'pincode']
        }
      ]
    });

    return result;
  } catch (err) {
    console.error('Error fetching OrderTrackings:', err);
    throw err;
  }
}



export async function getOrderTrackingById(id) {
  try {
    return await OrderTracking.findByPk(id, {
      include: [
        // { model: Payment, as: 'payment' },
        { model: User,    as: 'user' }
      ]
    });
  } catch (err) {
    console.error(`Error retrieving OrderTracking ${id}:`, err);
    throw err;
  }
}


export async function updateOrderTracking(id, updateData) {
  try {
    const [count, rows] = await OrderTracking.update(updateData, {
      where: { id },
      returning: true
    });
    return [count, rows];
  } catch (err) {
    console.error(`Error updating OrderTracking ${id}:`, err);
    throw err;
  }
}


export async function deleteOrderTrackingById(id) {
  try {
    const [count] = await OrderTracking.update(
      { is_active: false },
      { where: { id } }
    );
    return count;
  } catch (err) {
    console.error(`Error deleting OrderTracking ${id}:`, err);
    throw err;
  }
}



export async function deleteOrderTrackings(filters = {}) {
  try {
    const [count] = await OrderTracking.update(
      {
        is_active: false,
      },
      {
        where: {
          ...filters,
          is_active: true,
        },
      }
    );
    return count;
  } catch (err) {
    console.error('Error bulk deleting OrderTrackings:', err);
    throw err;
  }
}


export async function restoreOrderTrackingById(id) {
  try {
    const [count] = await OrderTracking.update(
      { is_active: true },
      { where: { id } }
    );
    return count;
  } catch (err) {
    console.error(`Error restoring OrderTracking ${id}:`, err);
    throw err;
  }
}


export async function restoreOrderTrackings() {
  try {
    const [count] = await OrderTracking.update(
      { is_active: true },
      { where: { is_active: false } } 
    );
    return count;
  } catch (err) {
    console.error('Error restoring OrderTrackings:', err);
    throw err;
  }
}


export const getOrderTrackingSummary = async (filters = {}) => {
  try {
    const {
      startDate,
      endDate,
      userId,
      status,
      minAmount,
      maxAmount,
    } = filters;

    const whereClause = {};

    // Date range filter
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Optional filters
    if (userId) {
      whereClause.user_id = userId;
    }

    if (status) {
      whereClause.status = status;
    }

    // Payment amount filter
    const paymentWhere = {};
    if (minAmount !== undefined) {
      paymentWhere.amount = { [Op.gte]: minAmount };
    }
    if (maxAmount !== undefined) {
      paymentWhere.amount = {
        ...(paymentWhere.amount || {}),
        [Op.lte]: maxAmount,
      };
    }

    const summary = await OrderTracking.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('order_tracking.id')), 'total_orders'],
        [fn('SUM', col('payment.amount')), 'total_revenue'],
      ],
      include: [
        {
          model: Payment,
          as: 'payment',
          attributes: [],
          required: false,
          where: Object.keys(paymentWhere).length > 0 ? paymentWhere : undefined,
        },
      ],
      where: whereClause,
      group: ['order_tracking.status'],
      raw: true,
    });

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    console.error('Error fetching order tracking summary:', error);
    throw new Error('Failed to fetch order tracking summary');
  }
};
