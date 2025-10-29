import express from 'express';
import {
  registerUser,
  getAll,
  getById,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  getMyUserConfig
} from '../controller/userConfig.controller.js';
import {validate, authenticate} from '../../middleware/index.js';
const router = express.Router();

router.post('/userconfig',authenticate(['end_user']), registerUser);                     
router.get('/userconfig', authenticate(['end_user']),getAll);    
router.get('/userconfig/me', authenticate(['end_user']), getMyUserConfig);
router.get('/userconfig/:id',authenticate(['end_user']), getById);                       
router.put('/userconfig/:id', authenticate(['end_user']),updateUser);                    
router.patch('/userconfig/:id/deactivate',authenticate(['end_user']), deactivateUser);   
router.patch('/userconfig/:id/activate',authenticate(['end_user']), activateUser);       
router.delete('/userconfig/:id',authenticate(['end_user']), deleteUser);


export default router;
