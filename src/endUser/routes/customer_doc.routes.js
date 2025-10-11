// src/routes/customer_doc.routes.js
import express from 'express';
import { customerDocUpload,validate,authenticate} from '../../middleware/index.js';
import {create,getAll,getById,getCounts,update,remove,restore} from '../controller/customer_doc.controller.js';
import {createCustomerDocSchema,updateCustomerDocSchema} from '../dto/customer_doc.dto.js';

const router = express.Router();

router.post('/docs/', customerDocUpload, validate(createCustomerDocSchema), authenticate(['end_user', 'admin', 'user_agent']),create);
router.get('/docs/', authenticate(['end_user', 'admin', 'user_agent']), getAll);

router.get('/docs_counts', authenticate(['end_user', 'admin', 'user_agent']),  getCounts);
router.get('/docs/:id', authenticate(['end_user', 'admin', 'user_agent']), getById);
router.put('/docs/:id', customerDocUpload, authenticate(['end_user', 'admin', 'user_agent']) ,validate(updateCustomerDocSchema), update);
router.delete('/docs/:id', authenticate(['end_user','admin']), remove); 
router.patch('/docs/restore/:id', authenticate(['admin']), restore); 

export default router;