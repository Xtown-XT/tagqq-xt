import express from 'express';
import profileRoutes from './profile.routes.js';
import userRoutes from './user.routes.js'
import orderTrack from './order_tracking.routes.js'
import ekycRouter from './ekyc.routes.js'
import customer_docRoutes from './customer_doc.routes.js';
import publicurlRouter from './public_url.routes.js';
import delivery_address from './delivery_address.routes.js';
import userConfigRouter from './userConfig.routes.js';
import districtRoutes from './address.district.routes.js';
import stateRoutes from './address.state.routes.js';
import countryRoutes from './address.country.routes.js';
// import other resource routes here...

const router = express.Router();

router.use('/enduser', profileRoutes);
router.use('/enduser', userRoutes);
router.use('/enduser',orderTrack);
router.use('/enduser',ekycRouter);
router.use('/enduser', customer_docRoutes);
router.use('/enduser', publicurlRouter);
router.use('/enduser', delivery_address);
router.use('/enduser',userConfigRouter);
router.use('/address', districtRoutes);
router.use('/address', stateRoutes);
router.use('/address', countryRoutes);
// etc.

export default router;
