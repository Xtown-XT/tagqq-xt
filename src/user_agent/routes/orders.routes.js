// routes/order.routes.js
import express from 'express';

import {createOrderController,
  getOrderByIdController,
  updateOrderController,
  deleteOrderController, 
  orderController,
  restoreOrderController} from '../controller/orders.controller.js';
import {validate,  authenticate } from '../../middleware/index.js';
import { createOrderSchema ,updateOrderSchema} from '../dto/orders.dto.js';

const router = express.Router();

router.post('/orders', validate(createOrderSchema), authenticate(['admin', 'user_agent']), createOrderController);
router.get('/orders',  authenticate(['admin', 'user_agent']), orderController.list);
router.get('/orders/:id',  authenticate(['admin', 'user_agent']), getOrderByIdController);
router.put('/orders/:id', validate(updateOrderSchema),  authenticate(['admin']), updateOrderController);
router.delete('/orders/:id',  authenticate(['admin']), deleteOrderController);
router.patch('/orders/:id/restore',  authenticate(['admin']), restoreOrderController);

export default router;
