import express from 'express';


import useragentRoutes from './user_agent.routes.js'
import partnerRoutes from './partner.routes.js';
import ordersRoutes from './orders.routes.js'


// import other resource routes here...

const router = express.Router();

router.use('/useragent', useragentRoutes);
router.use('/useragent', ordersRoutes);





router.use('/useragent',partnerRoutes)

export default router;

