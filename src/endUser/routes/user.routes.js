// routes/user.routes.js
import express from 'express';
import { registerUser, getAll ,changePasswordHandler,getUserAlreadyExist, registerUserwithouturl , getById, getCurrentUser,login, updateUser,deactivateUser,activateUser,forgotPassword,resetPassword, handleRefreshToken, logout } from '../controller/user.controller.js';
import {validate, authenticate} from '../../middleware/index.js';
import {userRegisterSchema,updateUserSchema, userLoginSchema, userRegisterSchemaurl} from '../dto/user.dto.js';


const router = express.Router();

router.post('/users/register', validate(userRegisterSchema), registerUser);
router.post('/users/userswithouturl', validate(userRegisterSchemaurl), registerUserwithouturl);
router.post('/users/login', validate(userLoginSchema), login);
router.get("/users/me",
      authenticate(['end_user']), 
     getCurrentUser);
router.get("/users", 
     authenticate(['end_user', 'admin', 'user_agent']), 
     getAll);
router.get("/users/:id", 
     authenticate(['end_user', 'admin', 'user_agent']), 
    getById); 
router.get("/isuser/:phone", 
     getUserAlreadyExist)
router.put("/users/:id", 
     authenticate(['end_user', 'admin', 'user_agent']),
    validate(updateUserSchema),updateUser);
router.delete("/users/:id", 
     authenticate(['admin']), 
    deactivateUser);
router.patch("/users/restore/:id",
      authenticate([ 'admin']), 
     activateUser);
router.post("/users/refreshtoken", handleRefreshToken);

router.post('/users/logout', authenticate(['end_user']), logout);

router.post('/users/forgot-password', forgotPassword);

router.post('/users/reset-password', resetPassword)
router.post('/users/change-password', authenticate(['end_user']),changePasswordHandler)



export default router;
