import express from 'express';
import publicUrlController from '../controller/public_url.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  createPublicUrlSchema,
  updatePublicUrlSchema,
  listPublicUrlsSchema,
  publicUrlIdSchema,
  createEmergencyUserSchema
} from '../dto/public_url.dto.js';
import {  authenticate } from '../../middleware/index.js';

const router = express.Router();

// CREATE
router.post(
  '/public-url',
  //  authenticate(['admin']),
  validate(createPublicUrlSchema),
  publicUrlController.create
);

// LIST ALL
router.get(
  '/public-url',
   authenticate(['end_user', 'admin', 'user_agent']),
  // validate(listPublicUrlsSchema),
  publicUrlController.list 
);

// GET BY ID
router.get(
  '/public-url/:id',
   authenticate(['end_user', 'admin', 'user_agent']),
  validate(publicUrlIdSchema),
  publicUrlController.getById
);

router.get(
  '/emergency/:id',
  validate(publicUrlIdSchema),
  publicUrlController.getByIdEm
);
router.post(
  '/emergency/:id',
   authenticate([ 'admin', 'user_agent']),
  validate(createEmergencyUserSchema),
  publicUrlController.createEmergencyUser
);

router.put(
  '/public-url/emergency/:id',
   authenticate([ 'admin','end_user', 'user_agent']),
  validate({ ...publicUrlIdSchema, }),
  publicUrlController.update
);

router.put(
  '/public-url/:id',
  authenticate(['admin']),
  validate({...publicUrlIdSchema,}),
  publicUrlController.updateUrl
);

router.put(
  '/public-urlforcaptain/:id',
  authenticate(['captain','admin']),
  validate({...publicUrlIdSchema,}),
  publicUrlController.updateUrlforCaptain
);

// DELETE
router.delete(
  '/public-url/:id',
   authenticate([ 'admin']),
  validate(publicUrlIdSchema),
  publicUrlController.remove
);

// BULK DELETE
router.delete(
  '/public-url',
   authenticate(['admin']),
  validate(listPublicUrlsSchema),
  publicUrlController.bulkRemove
);

// RESTORE BY ID
router.patch(
  '/public-url/:id/restore',
   authenticate(['admin']),
  validate(publicUrlIdSchema),
  publicUrlController.restoreById
);

// BULK RESTORE
router.patch(
  '/public-url/restore',
   authenticate(['admin']),
  validate(listPublicUrlsSchema),
  publicUrlController.bulkRestore
);

export default router;