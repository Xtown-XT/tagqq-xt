import express from 'express';
import { validate, authenticate } from '../../middleware/index.js';
import {
  create,
  getAll,
  getById,
  update,
  remove,
  restore
} from '../controller/bloodgroup.controller.js';
import {
  createBloodGroupSchema,
  updateBloodGroupSchema
} from '../dto/bloodgroup.dto.js';

const router = express.Router();

router.post(
  '/blood-groups/',
  validate(createBloodGroupSchema),
  authenticate([ 'end_user' , 'admin', 'user_agent']),
  create
);

router.get(
  '/blood-groups/',
  authenticate([ 'end_user' , 'admin', 'user_agent']),
  getAll
);

router.get(
  '/blood-groups/:id',
  authenticate([ 'end_user' , 'admin', 'user_agent']),
  getById
);

router.put(
  '/blood-groups/:id',
  validate(updateBloodGroupSchema),
  authenticate([ 'end_user' , 'admin', 'user_agent']),
  update
);

router.delete(
  '/blood-groups/:id',
  authenticate([ 'end_user' , 'admin', 'user_agent']),
  remove
);

router.patch(
  '/blood-groups/restore/:id',
  authenticate([ 'end_user' , 'admin', 'user_agent']),
  restore
);

export default router;
