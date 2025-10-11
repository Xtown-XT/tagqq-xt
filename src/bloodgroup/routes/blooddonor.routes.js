// src/blooddonor/controller/blood_donor.controller.js
import express from 'express';
import multer from 'multer';
import { authenticate, validate } from '../../middleware/index.js';
import { create, getAll, getById, update, remove, restore, bulkUploadBloodDonors, bulkUploadBloodDonorsExcel } from '../controller/blooddonor.controller.js';
import { createBloodDonorSchema, updateBloodDonorSchema , bulkUploadDonorsSchema } from '../dto/blooddonor.dto.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // temporary file storage


router.post('/', authenticate(['end_user','admin', 'user_agent']), validate(createBloodDonorSchema), create);
router.post('/bulkupload', authenticate([ 'end_user','admin', 'user_agent']),validate(bulkUploadDonorsSchema), bulkUploadBloodDonors);
router.get('/', authenticate(['end_user','admin', 'user_agent']), getAll);
router.get('/:id', authenticate([ 'end_user' , 'admin', 'user_agent']), getById);
router.put('/:id', authenticate([ 'end_user' , 'admin', 'user_agent']), validate(updateBloodDonorSchema), update);
router.delete('/:id', authenticate([ 'end_user' , 'admin', 'user_agent']), remove);
router.patch('/restore/:id', authenticate([ 'end_user' , 'admin', 'user_agent']), restore);
router.post('/bulk-upload-excel', authenticate(['admin', 'user_agent']), upload.single('file'), bulkUploadBloodDonorsExcel);


export default router;
