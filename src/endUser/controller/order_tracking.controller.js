import {createOrderTracking,
  getOrderTrackings,
  getOrderTrackingById,
  updateOrderTracking,
  deleteOrderTrackingById,
  deleteOrderTrackings,
  restoreOrderTrackingById,
  restoreOrderTrackings
} from '../service/order_tracking.service.js';

const orderTrackingController = {
  async create(req, res) {
    try {
      const payload = {
        delivery_address_id:req.body.delivery_address_id,
        payment_id: req.body.payment_id,
        status: req.body.status,
        user_id : req.body.user_id ?? req.user?.id
      };
      const record = await createOrderTracking(payload);
      return res.status(201).sendSuccess(record, 'Order tracking created successfully');
    } catch (err) {
      return res.sendError('Failed to create order tracking', 500, err);
    }
  },

async list(req, res) {
  try {
    const {
      page,
      limit,
      status,
      user_id,
      payment_id,
      orderBy,
      order
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const orderDir = ['ASC', 'DESC'].includes((order || '').toUpperCase())
      ? order.toUpperCase()
      : 'ASC';

    const { rows, count } = await getOrderTrackings({
      page: pageNum,
      limit: limitNum,
      status,
      user_id: req.admin ? user_id : undefined, // only admin can pass user_id
      payment_id: payment_id ? Number(payment_id) : undefined,
      orderBy: orderBy || 'createdAt',
      order: orderDir,

      // Pass auth context
      currentUser: req.user || null,
      isAdmin: Boolean(req.admin)
    });

    const totalPages = Math.ceil(count / limitNum);

    return res.status(200).sendSuccess(
      { data: rows, meta: { total: count, totalPages, currentPage: pageNum } },
      'Order trackings retrieved successfully'
    );
  } catch (err) {
    return res.sendError('Failed to retrieve order trackings', 500, err);
  }
},


  async getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.sendError('Invalid ID format', 400);

      const record = await getOrderTrackingById(id);
      if (!record) return res.sendError('Order tracking not found', 404);
      return res.status(200).sendSuccess(record, 'Order tracking retrieved successfully');
    } catch (err) {
      return res.sendError('Failed to retrieve order tracking', 500, err);
    }
  },

  async update(req, res) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.sendError('Invalid ID format', 400);

      const updateData = req.body;
      const [count, rows] = await updateOrderTracking(id, updateData);

      if (count === 0) return res.sendError('Order tracking not found', 404);
      return res.status(200).sendSuccess(rows[0], 'Order tracking updated successfully');
    } catch (err) {
      return res.sendError('Failed to update order tracking', 500, err);
    }
  },

  async remove(req, res) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.sendError('Invalid ID format', 400);

      const count = await deleteOrderTrackingById(id);
      if (count === 0) {
        return res.sendError('Order tracking not found or already deleted', 404);
      }

      return res.status(200).sendSuccess({ deleted: count }, 'Order tracking deleted successfully');
    } catch (err) {
      return res.sendError('Failed to delete order tracking', 500, err);
    }
  },

  async bulkRemove(req, res) {
    try {
      const { status, user_id, payment_id } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (user_id) filters.user_id = user_id;
      if (payment_id) filters.payment_id = Number(payment_id);

      const count = await deleteOrderTrackings(filters);
      if (count === 0) {
        return res.sendError('No matching order trackings found to delete', 404);
      }

      return res.status(200).sendSuccess({ deleted: count }, 'Order trackings deleted successfully');
    } catch (err) {
      return res.sendError('Failed to delete order trackings', 500, err);
    }
  },

  async restoreById(req, res) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.sendError('Invalid ID format', 400);

      const count = await restoreOrderTrackingById(id);
      if (count === 0) {
        return res.sendError('Order tracking not found or not deleted', 404);
      }

      return res.status(200).sendSuccess({ restored: count }, 'Order tracking restored successfully');
    } catch (err) {
      console.error('Restore OrderTracking error:', err);
      return res.sendError('Failed to restore order tracking', 500, err);
    }
  },

  async bulkRestore(req, res) {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.user_id) filters.user_id = req.query.user_id;
      if (req.query.payment_id) filters.payment_id = Number(req.query.payment_id);

      const count = await restoreOrderTrackings(filters);
      if (count === 0) {
        return res.sendError('No deleted order trackings matched for restore', 404);
      }

      return res.status(200).sendSuccess({ restored: count }, 'Order trackings restored successfully');
    } catch (err) {
      return res.sendError('Failed to restore order trackings', 500, err);
    }
  }
};

export default orderTrackingController;
