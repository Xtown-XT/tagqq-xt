import express from 'express';
import {
  registerCaptainUser,
  loginCaptain,
  getCurrentCaptainUser,
  getAllCaptainUsers,
  getCaptainUserByIdController,
  updateCaptainUser,
  deactivateCaptainUser,
  activateCaptainUser,
  forgotPasswordCaptain,
  resetPasswordCaptain,
  changePasswordCaptain,
  getCaptainAlreadyExist,
  logoutCaptain,
  handleCaptainRefreshToken
} from '../controller/captain_user.controller.js';

import { validate, authenticate, customerDocUpload } from '../../middleware/index.js';
import { captainUserRegisterSchema, captainUserLoginSchema } from '../dto/captain_user.dto.js';

const router = express.Router();

router.post('/captain/register', validate(captainUserRegisterSchema), registerCaptainUser);
router.post('/captain/login', validate(captainUserLoginSchema), loginCaptain);
router.get('/captain/me', authenticate(['captain']), getCurrentCaptainUser);
router.get('/captain/', authenticate(['captain','admin']), getAllCaptainUsers);
router.get('/captain/:id', authenticate(['captain','admin' ]), getCaptainUserByIdController);
router.get('/isuser/:phone', 
  // authenticate(['captain','admin']), 
  getCaptainAlreadyExist)
router.put('/captain/:id', authenticate(['captain','admin' ]), customerDocUpload, updateCaptainUser);
router.delete('/captain/:id', authenticate(['captain','admin' ]), deactivateCaptainUser);
router.patch('/captain/restore/:id', authenticate(['admin']), activateCaptainUser);
router.post('/captain/forgot-password', forgotPasswordCaptain);
router.post('/captain/reset-password', resetPasswordCaptain);
router.post('/captain/change-password', authenticate(['captain']), changePasswordCaptain);
router.post('/captain/logout', authenticate(['captain']), logoutCaptain);
router.post('/captain/refreshtoken', handleCaptainRefreshToken);

export default router;
