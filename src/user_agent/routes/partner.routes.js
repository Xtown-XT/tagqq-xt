import express from 'express';
import partnerController from '../controller/partner.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  createPartnerSchema,
  updatePartnerSchema,
  partnerIdSchema,
} from '../dto/partner.dto.js';
import {  authenticate } from '../../middleware/index.js';

const router = express.Router();

// CREATE Partner
router.post(
  '/partner',
   authenticate(['admin']),
  validate(createPartnerSchema),
  partnerController.create
);

// LIST Partners
router.get(
  '/partner',
   authenticate(['admin', 'user_agent']),
//   validate(listPartnersSchema),
  partnerController.list
);

//Get Partner Types
router.get('/partner/types', 
   authenticate(['admin', 'user_agent']),
   partnerController.getPartnerTypes);

   
// GET Partner BY ID
router.get(
  '/partner/:id',
   authenticate(['admin', 'user_agent']),
  validate(partnerIdSchema),
  partnerController.getById
);


// UPDATE Partner
router.put(
  '/partner/:id',
   authenticate(['admin', 'user_agent']),
  validate({ ...partnerIdSchema, ...updatePartnerSchema }),
  partnerController.update
);

// DELETE Partner BY ID
router.delete(
  '/partner/:id',
   authenticate(['admin', 'user_agent']),
  validate(partnerIdSchema),
  partnerController.remove
);

// BULK DELETE Partners
router.delete(
  '/partner',
   authenticate(['admin', 'user_agent']),
//   validate(listPartnersSchema),
  partnerController.bulkRemove
);

// RESTORE Partner BY ID
router.patch(
  '/partner/:id/restore',
   authenticate(['admin', 'user_agent']),
  validate(partnerIdSchema),
  partnerController.restoreById
);

// BULK RESTORE Partners
router.patch(
  '/partner/restore',
   authenticate(['admin', 'user_agent']),
//   validate(listPartnersSchema),
  partnerController.bulkRestore
);

export default router;