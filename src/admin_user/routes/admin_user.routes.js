// routes/admin_user.routes.js
import express from 'express';
import {
  registerAdmin,
  getAllAdmins,
  getAdminByIdCtrl,
  getCurrentAdmin,
  login,
  updateAdmin,
  deactivateAdmin,
  dashboardGlobalSearchCtrl,
  dashboardAdmin,
  activateAdmin,
  handleRefreshToken,
  changePasswordHandler,
  resetPassword,
  forgotPassword,
  verifyAdminPasswordController,
  logout
} from '../controller/admin_user.controller.js';
import { validate, authenticate } from '../../middleware/index.js';
import {
  adminRegisterSchema,
  updateAdminSchema,
  adminLoginSchema
} from '../dto/admin_user.dto.js';

import { handleGetQRCodeSummary, getOrderStats } from '../controller/revenue.controller.js';
import { getDashboardStats } from '../controller/revenue.controller.js';


const router = express.Router();

// Admin registration and authentication
router.post('/admins/register', validate(adminRegisterSchema), authenticate([ 'admin']), registerAdmin);  // edit  for registration 

router.post('/admins/login', validate(adminLoginSchema), login);
router.post('/admins/refreshtoken', handleRefreshToken);

// Admin profile and management routes (protected)
router.get('/admins/me', authenticate(['admin']), getCurrentAdmin);
router.get('/admins', authenticate(['admin']), getAllAdmins);
router.get('/admins/:id', authenticate(['admin']), getAdminByIdCtrl);
router.put('/admins/:id', authenticate(['admin']), validate(updateAdminSchema), updateAdmin);
router.delete('/admins/:id', authenticate(['admin']), deactivateAdmin);
router.patch('/admins/restore/:id', authenticate(['admin']), activateAdmin);
router.get('/dashboard',
  // authenticate(['admin']), 
  dashboardAdmin);
router.post('/admins/forgot-password', forgotPassword);
router.post('/admins/reset-password', resetPassword);
router.post('/admins/change-password', authenticate(['admin']), changePasswordHandler);

router.post('/admins/verify-password', authenticate(['admin']), verifyAdminPasswordController);
router.post('/admins/logout', authenticate(['admin']), logout);


//Admin revenue report
router.get('/revenue', authenticate(['admin']), getOrderStats);

//QR 
router.get('/summary', authenticate(['admin']), handleGetQRCodeSummary);

// Vehicle reports
router.get('/dashboard-stats', authenticate(['admin']), getDashboardStats);
router.get('/dashboard/search', authenticate(['admin']), dashboardGlobalSearchCtrl);
export default router;
