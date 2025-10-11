import express from 'express';
import {
  create,
  getAll,
  getById,
  update,
  remove,
  restore
} from '../controller/address.country.controller.js';
import { validate, authenticate } from '../../middleware/index.js';
import {
  createCountrySchema,
  updateCountrySchema
} from '../dto/address.country.dto.js';

const router = express.Router();

router.post('/country/', validate(createCountrySchema), authenticate(['end_user','admin', 'user_agent']), create);
router.get('/country/', authenticate([ 'end_user' , 'admin', 'user_agent']), getAll);
router.get('/country/:id', authenticate([ 'end_user' , 'admin', 'user_agent']), getById);
router.put('/country/:id', validate(updateCountrySchema), authenticate([ 'end_user' , 'admin', 'user_agent']), update);
router.delete('/country/:id', authenticate([ 'end_user' , 'admin', 'user_agent']), remove);
router.patch('/country/restore/:id', authenticate([ 'end_user' , 'admin', 'user_agent']), restore);

export default router;
