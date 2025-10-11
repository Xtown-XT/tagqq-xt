// controllers/order.controller.js
import {
  createOrderService,
  getOrders,
  getOrderByIdService,
  updateOrderService,
  deleteOrderService,
  restoreOrderService
} from '../service/orders.service.js';
import exportToPdf from "../../utils/exportPdf.js";
// export const createOrderController = async (req, res) => {
//   try {
//     // const updatedBy = req.user?.id ?? req.userAgent?.id ?? req.admin?.id;
//     const createPayload = {
//       ...req.body,
//       created_by: req.user?.id ?? req.userAgent?.id ?? req.admin?.id,
//     };
//     const result = await createOrderService(createPayload, req.userAgent); 
//     res.sendSuccess({result},'Order created successfully');
//   } catch (error) {
//     console.error('Order creation failed:', error);
//     res.sendError(error.message, 500);
//   }
// };

export const createOrderController = async (req, res) => {
  try {
    // 1) Figure out the current actor (could be an end‑user, userAgent, or admin)
    const actorId = req.user?.id ?? req.userAgent?.id ?? req.admin?.id;

    const status = (req.admin?.id != null)
      ? 'fulfillment'
      : 'processing';

    // 2) Build the payload for creation; fall back to actorId if not explicitly provided
    const createPayload = {
      ...req.body,
      admin_id: req.admin?.id || null,
      status: status,
      createdBy: req.body.createdBy || actorId,
      updatedBy: req.body.updatedBy || req.body.createdBy || actorId
    };

    console.log('Create Order Payload:', createPayload);

    // 3) Extract agentInput if present (e.g. for agent‑driven orders)
    const agentInput = req.body.userAgent ?? req.userAgent ?? null;

    // 4) Extract adminInput if present (for hub/admin‑driven orders)
    const adminInput = req.body.admin ?? req.admin ?? null;

    // 5) Call your service with both parameters
    const result = await createOrderService(
      createPayload,
      agentInput,
      adminInput
    );

    // 6) Success response
    res.sendSuccess({ result }, 'Order created successfully');
  } catch (error) {
    console.error('Order creation failed:', error);
    res.sendError(error.message, 500);
  }
};




export const getOrderByIdController = async (req, res) => {
  try {
    const updatedBy = req.user?.id ?? req.userAgent?.id ?? req.admin?.id;
    const updatePayload = {
      ...req.body,
      updated_by: updatedBy
    };
    const order = await getOrderByIdService(req.params.id);
    res.sendSuccess({ data: order }, 'Order retrieved successfully');
  } catch (error) {
    res.sendError(error.message, 404);
  }
};

export const updateOrderController = async (req, res) => {
  try {
    console.log('Incoming body:', req.body);
    console.log("Incoming body raw:", req.body);

    const updated = await updateOrderService(
      req.params.id,
      req.body,
      req.admin?.id
    );
    res.sendSuccess({ data: updated }, 'Order updated successfully');
  } catch (error) {
    console.error('Error in updateOrderController:', error);
    res.sendError(error.message, 400);
  }
};


export const deleteOrderController = async (req, res) => {
  try {
    await deleteOrderService(req.params.id, req.admin?.id);
    res.sendSuccess({}, 'Order deleted successfully');
  } catch (error) {
    res.sendError(error.message, 404);
  }
};

export const restoreOrderController = async (req, res) => {
  try {
    const restored = await restoreOrderService(req.params.id, req.admin?.id);
    res.sendSuccess({ data: restored }, 'Order restored successfully');
  } catch (error) {
    res.sendError(error.message, 404);
  }
};

//getall
export const orderController = {
  async list(req, res) {
    try {
      const {
        includeInactive,
        is_active,
        status,
        partner_id,
        view,
        order_by,
        search,
        startDate,
        endDate,
        page,
        limit,
        orderBy,
        order,
        noPagination,
        is_master,
        export: exportType,
        foradmin,
        foruseragent,
      } = req.query;

      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.max(1, Number(limit) || 10);
      const orderDir = ['asc', 'desc'].includes((order || '').toLowerCase())
        ? order.toLowerCase()
        : 'asc';

      const usePagination = noPagination !== 'true' && is_master !== 'true';
      const foradminFlag = foradmin === 'true';
      const foruseragentFlag = foruseragent === 'true';


      const { rows, count } = await getOrders({
        includeInactive,
        is_active: is_active === undefined ? undefined : is_active === 'true',
        status: status ? status.split(',') : undefined,
        partner_id,
        order_by,
        search,
        startDate,
        endDate,
        view,
        page: usePagination ? pageNum : undefined,
        limit: usePagination ? limitNum : undefined,
        orderBy: orderBy || 'createdAt',
        order: orderDir,
        userAgent: req.userAgent || null,
        isAdmin: Boolean(req.admin),
        is_master: is_master === 'true',
        foradmin: foradminFlag,
        foruseragent: foruseragentFlag,
      });

      const totalPages = usePagination ? Math.ceil(count / limitNum) : 1;
      const currentPage = usePagination ? pageNum : 1;
      if (exportType === 'pdf') {
        const templatePath = 'orders-report.ejs';

        const data = {
          date: new Date().toLocaleDateString(),
          totalCount: count,
          orders: rows.map(order => ({
            order_code: order.order_code || 'N/A',
            total_qr: order.no_of_qr_ordered ?? 'N/A',
            delivered_qr: order.no_of_qr_delivered ?? 'N/A',
            partner_type: order.partner?.partner_type || 'N/A',
            partner_name: order.partner?.name || 'N/A',
            order_by: order.user_agent?.useragent_name || 'N/A',
            status: order.status || 'N/A',
            ordered_date: order.createdAt || 'N/A',
          }))
        };

        const pdfBuffer = await exportToPdf(templatePath, data);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=orders-${Date.now()}.pdf`);
        return res.send(pdfBuffer);
      }
      return res.sendSuccess(
        {
          data: rows,
          meta: { total: count, totalPages, currentPage },
        },
        'Orders retrieved successfully'
      );
    } catch (err) {
      console.error('Error in orderController.list():', err);
      return res.sendError('Failed to retrieve orders', 500, err.message);
    }
  },
};
