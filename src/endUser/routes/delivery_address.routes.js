import express from 'express';
import { validate,  authenticate } from '../../middleware/index.js';
import { 
  create, 
  getAll, 
  getById, 
  update, 
  remove, 
  restore 
} from '../controller/delivery_address.controller.js';
import { 
  createDeliveryAddressSchema, 
  updateDeliveryAddressSchema 
} from '../dto/delivery_address.dto.js';

const router = express.Router();

router.post('/delivery-address',  authenticate(['end_user', 'admin']), validate(createDeliveryAddressSchema), create);
router.get('/delivery-address',  authenticate(['end_user', 'admin']), getAll);
router.get('/delivery-address/:id',  authenticate(['end_user', 'admin']), getById);
router.put('/delivery-address/:id',  authenticate(['end_user', 'admin']), validate(updateDeliveryAddressSchema), update);
router.delete('/delivery-address/:id',  authenticate(['end_user', 'admin']), remove);
router.patch('/delivery-address/restore/:id',  authenticate(['end_user', 'admin']), restore);

export default router;