import express from 'express';
import { registerUserAgent,logout, login,forgotPassword,resetPassword,changePasswordHandler,dashboardHandler, getAllUserAgents,getUserAgentByIdController,getCurrentUserAgent,updateUserAgent,deactivateUserAgent,activateUserAgent} from '../controller/user_agent.controller.js';
import { validate, authenticate } from '../../middleware/index.js';
import { userAgentRegisterSchema, userAgentLoginSchema } from '../dto/user_agent.dto.js'; 

const router = express.Router();

router.post('/useragent/register', validate(userAgentRegisterSchema), authenticate(['end_user', 'admin', 'user_agent']), registerUserAgent);
router.post('/useragent/login', validate(userAgentLoginSchema),login);
router.get("/useragent/me",  authenticate(['end_user', 'admin', 'user_agent']), getCurrentUserAgent);
router.get('/useragent/', authenticate(['end_user', 'admin', 'user_agent']),getAllUserAgents );
router.get('/dashboard', 
  authenticate(['user_agent']), 
  dashboardHandler
  );
router.get('/useragent/:id',  authenticate(['end_user', 'admin', 'user_agent']),getUserAgentByIdController);
router.put("/useragent/:id", authenticate(['end_user', 'admin', 'user_agent']), updateUserAgent);
router.delete("/useragent/:id", authenticate(['end_user', 'admin', 'user_agent']),  deactivateUserAgent);
router.patch("/useragent/restore/:id", authenticate(['end_user', 'admin', 'user_agent']),activateUserAgent);
router.post('/useragent/forgot-password', forgotPassword);
router.post('/useragent/reset-password', resetPassword);
router.post('/useragent/change-password',  authenticate(['user_agent']), changePasswordHandler,);
router.post('/useragent/logout', authenticate(['user_agent']), logout);

export default router;         