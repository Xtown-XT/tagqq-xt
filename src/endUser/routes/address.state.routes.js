import express from 'express';
import { create, getAll, getById, update, remove, restore } from '../controller/address.state.controller.js';
import { validate, authenticate } from '../../middleware/index.js';
import { createStateSchema, updateStateSchema } from '../dto/address.state.dto.js';

const router = express.Router();

router.post('/state/', validate(createStateSchema), authenticate([ 'end_user' , 'admin', 'user_agent']), create);
router.get('/state/', authenticate([ 'end_user' , 'admin', 'user_agent']), getAll);
router.get('/state/:id', authenticate([ 'end_user' , 'admin', 'user_agent']), getById);
router.put('/state/:id', validate(updateStateSchema), authenticate([ 'end_user' , 'admin', 'user_agent']), update);
router.delete('/state/:id', authenticate([ 'end_user' , 'admin', 'user_agent']), remove);
router.patch('/state/restore/:id', authenticate([ 'end_user' , 'admin', 'user_agent']), restore);

export default router;
