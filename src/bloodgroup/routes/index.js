import express from 'express';
import bloodGroupRoutes from './bloodgroup.routes.js';
import bloodDonorRoutes from './blooddonor.routes.js';

// import other resource routes here...

const router = express.Router();

router.use('/bloodgroup', bloodGroupRoutes);
router.use('/blooddonor', bloodDonorRoutes);

export default router;
