// import { getOrderTrackingSummary } from '../../endUser/service/order_tracking.service.js';
// import { orderStatsQuerySchema } from '../dto/revenue.dto.js';
// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc.js';

// import { getQRCodeSummary } from '../../endUser/service/public_url.service.js';
// import { getRCCountByDistrict, getVehicles } from '../../endUser/service/profile.service.js';


// dayjs.extend(utc);

// dayjs.extend(utc);

// export const getOrderStats = async (req, res) => {
//   try {
//     // Validate query params using Zod
//     const validated = orderStatsQuerySchema.parse(req.query);

//     const {
//       startDate,
//       endDate,
//       minAmount,
//       maxAmount,
//       userId,
//       status,
//     } = validated;

//     // Convert to UTC ISO date objects
//     const start = dayjs.utc(startDate).startOf('day').toDate();
//     const end = dayjs.utc(endDate).endOf('day').toDate();

//     // Build filters
//     const filters = {
//       startDate: start,
//       endDate: end,
//       minAmount,
//       maxAmount,
//       userId,
//       status,
//     };

//     const stats = await getOrderTrackingSummary(filters);

//     return res.status(200).json({
//       success: true,
//       data: stats.data,
//     });
//   } catch (error) {
//     if (error.name === 'ZodError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation Error',
//         errors: error.errors,
//       });
//     }

//     console.error('Error in getOrderStats:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal Server Error',
//     });
//   }
// };


// export const handleGetQRCodeSummary  = async (req, res) => {
//   try {
//     const summary = await getQRCodeSummary();
//     return res.status(200).json({
//       success: true,
//       data: {
//         activeCount: summary.activeCount,
//         inactiveCount: summary.inactiveCount
//       },
//       message: 'QR code summary fetched successfully'
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to fetch QR code summary',
//       error: error.message
//     });
//   }
// };



// // Fetch RC count by district
// // export const handleGetRCCountByDistrict = async (req, res) => {
// //   try {
// //     const result = await getRCCountByDistrict();
// //     res.status(200).json({
// //       success: true,
// //       data: result.data,
// //       message: 'RC by district fetched successfully',
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: error.message || 'Something went wrong',
// //     });
// //   }
// // };

// export const handleGetRCCountByDistrict = async (req, res) => {
//   try {
//     // Use Zod to safely parse query params
//     const validated = orderStatsQuerySchema.parse(req.query);

//     const { startDate, endDate } = validated;

//     const result = await getRCCountByDistrict(startDate, endDate);

//     res.status(200).json(result);
//   } catch (error) {
//     console.error('Error in controller:', error);

//     res.status(400).json({
//       success: false,
//       message: error.message || 'Something went wrong',
//     });
//   }
// };



// // Fetch Vehicle Counts

// export const handleGetVehiclesCount = async (req, res) => {
//   try {
//     const result = await getVehicles(); // Assuming this is your service method

//     if (!result.success) {
//       return res.status(500).json({
//         success: false,
//         message: result.message || 'Unexpected error while fetching RC count',
//         error: result.error || null
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: result.data,
//       message: result.message
//     });
//   } catch (error) {
//     console.error('Controller error in handleGetVehiclesCount:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error while fetching RC count',
//       error: error.message
//     });
//   }
// };




// src/admin_user/controller/revenue.controller.js

import { getOrderTrackingSummary } from '../../endUser/service/order_tracking.service.js';
import { getQRCodeSummary } from '../../endUser/service/public_url.service.js';
import { getRCCountByDistrict, getVehicles } from '../../endUser/service/profile.service.js';
import { orderStatsQuerySchema } from '../dto/revenue.dto.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

// --- Order Stats ---
export const getOrderStats = async (req, res) => {
  try {
    const validated = orderStatsQuerySchema.parse(req.query);
    const { startDate, endDate, minAmount, maxAmount, userId, status } = validated;

    const start = dayjs.utc(startDate).startOf('day').toDate();
    const end   = dayjs.utc(endDate).endOf('day').toDate();

    const stats = await getOrderTrackingSummary({ startDate: start, endDate: end, minAmount, maxAmount, userId, status });

    return res.json({ success: true, data: stats.data });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Invalid query parameters', errors: err.errors });
    }
    console.error('Error in getOrderStats:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// --- QR Code Summary ---
export const handleGetQRCodeSummary = async (req, res) => {
  try {
    const summary = await getQRCodeSummary();
    return res.json({
      success: true,
      data: { activeCount: summary.activeCount, inactiveCount: summary.inactiveCount },
      message: 'QR code summary fetched successfully'
    });
  } catch (err) {
    console.error('Error in handleGetQRCodeSummary:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch QR code summary', error: err.message });
  }
};

// Vehicle Reports
export const getDashboardStats = async (req, res) => {
  try {

    const validated = orderStatsQuerySchema.parse(req.query);

    const { startDate, endDate } = validated;

    const rcDistrictResult = await getRCCountByDistrict(startDate, endDate);

    const vehicleStatsResult = await getVehicles(startDate, endDate);

    if (!rcDistrictResult.success || !vehicleStatsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'One or more data sources failed',
        errors: {
          rcDistrictError: rcDistrictResult.error || null,
          vehicleStatsError: vehicleStatsResult.error || null
        }
      });
    }

    return res.status(200).json({
      success: true,
      districtRc: rcDistrictResult.data,     
      vehiclesCount: vehicleStatsResult.data,  
      message: 'Dashboard stats fetched successfully',
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      error: err.errors || err.message,
    });
  }
};