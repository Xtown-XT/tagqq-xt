import express from 'express';
import profileController from '../controller/profile.controller.js';
import { customerDocUpload,validate,authenticate} from '../../middleware/index.js';
import {
  createProfileSchema,
  updateProfileSchema,
  listProfilesSchema,
  profileIdSchema
} from '../dto/profile.dto.js';

const router = express.Router();

// CREATE
router.post(
  '/profile',customerDocUpload, authenticate(['end_user','captain', 'user_agent',  'admin']),
  validate(createProfileSchema),
  profileController.create
);

router.get(
  '/profile', 
  authenticate(['end_user', 'admin', 'captain','user_agent']),
  // validate(listProfilesSchema),
  profileController.list
);

router.get(
  '/profile/completion',
  authenticate(['end_user', 'admin', 'user_agent', 'captain']), 
  profileController.getCompletion
);

// GET BY ID
router.get(
  '/profile/:id', authenticate(['end_user', 'admin', 'user_agent']),
  validate(profileIdSchema),
  profileController.getById
);

router.put(
  '/profile/:id',

  authenticate(['end_user','admin', 'captain','user_agent']),

//   authenticate(['end_user','admin','user_agent', 'captain']),

  customerDocUpload,            // Multer ⬅ parses the file
  validate(profileIdSchema),    // coerce & validate :id
  validate(updateProfileSchema),// validate the rest
  profileController.update
);


// DELETE
router.delete(
  '/profile/:id', authenticate(['admin']),
  validate(profileIdSchema),
  profileController.remove
);

// BULK DELETE
router.delete(
  '/profile', authenticate(['admin']),
  validate(listProfilesSchema),
  profileController.bulkRemove
);

// RESTORE BY ID
router.patch(
  '/profile/:id/restore', authenticate(['admin']),
  validate(profileIdSchema),
  profileController.restoreById
);

// BULK RESTORE
router.patch(
  '/profile/restore', authenticate(['admin']),
  validate(listProfilesSchema),
  profileController.bulkRestore
);
    
export default router;
