import {
  createEnhancementService,
  getAllEnhancementsService,
  getEnhancementByIdService,
  updateEnhancementService,
  deleteEnhancementService,
  restoreEnhancementService,
  hardDeleteEnhancementService,
} from '../service/captain_suggestion.service.js';

import {
  createEnhancementSchema,
  enhancementIdSchema,
  getEnhancementsQuerySchema,
} from '../dto/captain_suggestion.dto.js';


// Create 
export const createEnhancementController = async (req, res) => {
  try {
    const validatedBody = createEnhancementSchema.parse(req.body);

    const authUser = req.user || req.admin || req.captain;
    if (!authUser || !authUser.id) {
      return res.status(401).json({ error: "Unauthorized. User information is missing." });
    }

    const enhancement = await createEnhancementService(validatedBody, authUser);

    res.status(201).json({
      message: 'Enhancement created successfully.',
      data: enhancement,
    });
  } catch (error) {
    console.error("Create Enhancement Error:", error);
    res.status(400).json({
      error: error.errors?.[0]?.message || error.message,
    });
  }
};


// // Get All
// export const getAllEnhancementsController = async (req, res) => {
//   try {
//     const validatedQuery = getEnhancementsQuerySchema.parse(req.query);
//     const enhancements = await getAllEnhancementsService(validatedQuery);
//     return res.status(200).json({ data: enhancements });
//   } catch (error) {
//     console.error('Get All Enhancements Error:', error);
//     const statusCode = error.name === 'ZodError' ? 422 : 500;
//     return res.status(statusCode).json({
//       error: error.errors?.[0]?.message || error.message || 'Internal Server Error'
//     });
//   }
// };

export const getAllEnhancementsController = async (req, res) => {
  try {
    const validatedQuery = getEnhancementsQuerySchema.parse(req.query);

    // 🔐 Identify user from token (admin or captain)
    const user = req.admin || req.captain;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // 📌 Add a normalized role and id field
    const requester = {
      role: req.admin ? "Admin" : "Captain",
      id: user.id
    };

    // ✅ Pass the requester object to the service
    const enhancements = await getAllEnhancementsService({
      ...validatedQuery,
      requester
    });

    return res.status(200).json({ data: enhancements });
  } catch (error) {
    console.error("Get All Enhancements Error:", error);
    const statusCode = error.name === "ZodError" ? 422 : 500;
    return res.status(statusCode).json({
      error: error.errors?.[0]?.message || error.message || "Internal Server Error",
    });
  }
};


// Get by ID
export const getEnhancementByIdController = async (req, res) => {
  try {
    const { id } = enhancementIdSchema.parse(req.params);
    const validatedQuery = getEnhancementsQuerySchema.parse(req.query);

    const currentUser = req.admin || req.captain || req.user;

    const submitterId = req.query.submitter_id || null;

    const enhancement = await getEnhancementByIdService(
      id,
      validatedQuery.docs_name,
      validatedQuery.startDate,
      validatedQuery.endDate,
      validatedQuery.status,
      validatedQuery.month,
      currentUser,
      submitterId
    );

    return res.status(200).json({ data: enhancement });
  } catch (error) {
    console.error('Get Enhancement by ID Error:', error);

    let statusCode = 500;
    let errorMessage = 'Internal Server Error';

    if (error.name === 'ZodError') {
      statusCode = 422;
      errorMessage = error.errors?.[0]?.message || 'Validation error';
    } else if (error.message.includes('Access denied')) {
      statusCode = 403;
      errorMessage = 'User verified but not authorized to access this enhancement.';
    } else if (error.message.includes('Enhancement not found')) {
      statusCode = 200;
      return res.status(statusCode).json({
        message: 'User verified successfully but has no enhancement history.',
        data: [],
      });
    } else if (error.message.includes('User role missing')) {
      statusCode = 401;
      errorMessage = 'User role missing in request context.';
    }

    return res.status(statusCode).json({ error: errorMessage });
  }
};

// Update Enhancement
export const updateEnhancementController = async (req, res) => {
  try {
    const { id } = enhancementIdSchema.parse(req.params);
    const payload = createEnhancementSchema.parse(req.body);

    const currentUser = req.admin || req.captain || req.user;

    const updatedEnhancement = await updateEnhancementService(id, payload, currentUser);

    return res.status(200).json({ message: 'Enhancement updated successfully.', data: updatedEnhancement });
  } catch (error) {
    console.error('Update Enhancement Error:', error);

    const statusCode =
      error.name === 'ZodError'
        ? 422
        : error.message.includes('Unauthorized')
          ? 401
          : error.message.includes('Access denied')
            ? 403
            : error.message.includes('Forbidden')
              ? 403
              : error.message.includes('Enhancement not found')
                ? 404
                : 500;

    return res.status(statusCode).json({
      error: error.errors?.[0]?.message || error.message || 'Internal Server Error',
    });
  }
};


// Soft Delete 
export const softDeleteEnhancementController = async (req, res) => {
  try {
    const { id } = enhancementIdSchema.parse(req.params);
    const currentUser = req.admin || req.captain || req.user;

    const result = await deleteEnhancementService(id, currentUser);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Soft Delete Error:', error);

    const statusCode =
      error.name === 'ZodError'
        ? 422
        : error.message.includes('Unauthorized')
          ? 401
          : error.message.includes('Access denied')
            ? 403
            : error.message.includes('Forbidden')
              ? 403
              : error.message.includes('Enhancement not found')
                ? 404
                : 500;

    return res.status(statusCode).json({ error: error.message || 'Internal Server Error' });
  }
};


// Restore 
export const restoreEnhancementController = async (req, res) => {
  try {
    const { id } = enhancementIdSchema.parse(req.params);
    const currentUser = req.admin || req.captain || req.user;

    const result = await restoreEnhancementService(id, currentUser);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Restore Enhancement Error:', error);

    const statusCode =
      error.name === 'ZodError'
        ? 422
        : error.message.includes('Unauthorized')
          ? 401
          : error.message.includes('Access denied')
            ? 403
            : error.message.includes('Forbidden')
              ? 403
              : error.message.includes('Enhancement not found')
                ? 404
                : 500;

    return res.status(statusCode).json({ error: error.message || 'Internal Server Error' });
  }
};


// Hard Delete 
export const hardDeleteEnhancementController = async (req, res) => {
  try {
    const { id } = enhancementIdSchema.parse(req.params);
    const currentUser = req.admin || req.captain || req.user;

    const result = await hardDeleteEnhancementService(id, currentUser);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Hard Delete Error:', error);

    const statusCode =
      error.name === 'ZodError'
        ? 422
        : error.message.includes('Unauthorized')
          ? 401
          : error.message.includes('Access denied')
            ? 403
            : error.message.includes('Forbidden')
              ? 403
              : error.message.includes('Enhancement not found')
                ? 404
                : 500;

    return res.status(statusCode).json({ error: error.message || 'Internal Server Error' });
  }
};


