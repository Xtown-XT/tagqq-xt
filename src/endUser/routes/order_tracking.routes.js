import express from 'express';
import orderTrackingController from '../controller/order_tracking.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  createOrderTrackingSchema,
  updateOrderTrackingSchema,
  listOrderTrackingsSchema,
  orderTrackingIdSchema
} from '../dto/order_tracking.dto.js';
import {  authenticate } from '../../middleware/index.js';

const router = express.Router();

// CREATE
router.post(
  '/order_tracking', authenticate(['admin']),
  validate(createOrderTrackingSchema),
  orderTrackingController.create
);

// LIST
router.get(
  '/order_tracking', authenticate(['end_user', 'admin']),
//   validate(listOrderTrackingsSchema),
  orderTrackingController.list
);

// GET BY ID
router.get(
  '/order_tracking/:id', authenticate(['end_user', 'admin']),
  validate(orderTrackingIdSchema),
  orderTrackingController.getById
);
// UPDATE
router.put(
  '/order_tracking/:id', authenticate(['admin']),
  validate({ ...orderTrackingIdSchema, ...updateOrderTrackingSchema }),
  orderTrackingController.update
);

// DELETE SINGLE
router.delete(
  '/order_tracking/:id', authenticate(['admin']),
  validate(orderTrackingIdSchema),
  orderTrackingController.remove
);

// BULK DELETE
router.delete(
  '/order_tracking', authenticate(['admin']),
  validate(listOrderTrackingsSchema),
  orderTrackingController.bulkRemove
);

router.patch(
  '/order_tracking/:id/restore', authenticate(['admin']),
  validate(orderTrackingIdSchema),
  orderTrackingController.restoreById
);

// BULK RESTORE
router.patch(
  '/order_tracking/restore', authenticate(['admin']),
  validate(listOrderTrackingsSchema),
  orderTrackingController.bulkRestore
);

export default router;
