
// routes/captain_checkins.routes.js
import express from 'express';
import {
  createCheckinController,
  updateCheckinController,
  getAllCheckinsController,
  getCheckinByIdController,
  deleteCheckinController,
  restoreCheckinController,
  exportAllCheckinsPdfController,
 
} from '../controller/captain_checkins.controller.js';

import { validate, authenticate } from '../../middleware/index.js';
import { createCheckinSchema, updateCheckinSchema  } from '../dto/captain_checkins.dto.js';

const router = express.Router();



// CRUD

router.get('/captain_attendance/report',
   authenticate(['admin', 'captain']),
   exportAllCheckinsPdfController);

router.post('/captain_attendance', validate(createCheckinSchema),
authenticate(['admin', 'captain']),
 createCheckinController);

router.get('/captain_attendance',
   authenticate(['admin']), 
   getAllCheckinsController);
   
router.get('/captain_attendance/:captainId',
   authenticate(['admin', 'captain']),
   getCheckinByIdController);

router.put('/captain_attendance/:captainId', validate(updateCheckinSchema),
  authenticate(['admin']), 
 updateCheckinController);

router.delete('/captain_attendance/:Id', 
  authenticate(['admin' ]), 
  deleteCheckinController);

router.patch('/captain_attendance/restore/:Id',
   authenticate(['admin']), 
   restoreCheckinController);

export default router;