import express from 'express';
import { create, getAll, getById, update, remove, restore } from '../controller/address.district.controller.js';
import { validate, authenticate } from '../../middleware/index.js';
import { createDistrictSchema, updateDistrictSchema } from '../dto/address.district.dto.js';

const router = express.Router();

router.post('/district/', validate(createDistrictSchema), authenticate([ 'end_user' , 'admin', 'user_agent']), create);
router.get('/district/', authenticate([ 'end_user' , 'admin', 'user_agent']), getAll);
router.get('/district/:id', authenticate([ 'end_user' , 'admin', 'user_agent']), getById);
router.put('/district/:id', validate(updateDistrictSchema), authenticate([ 'end_user' , 'admin', 'user_agent']), update);
router.delete('/district/:id', authenticate([ 'end_user' , 'admin', 'user_agent']), remove);
router.patch('/district/restore/:id', authenticate([ 'end_user' , 'admin', 'user_agent']), restore);

export default router;