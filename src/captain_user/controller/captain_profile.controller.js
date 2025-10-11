// // import captainProfileService from "../service/captain_profile.service.js";

// // export async function createCaptainProfile(req, res) {
// //   try {
// //     const data = await captainProfileService.create(req.body);
// //     res.status(201).json({ status: "success", data });
// //   } catch (error) {
// //     res.status(error.status || 400).json({ status: "error", message: error.message });
// //   }
// // }

// // export async function getCaptainProfileById(req, res) {
// //   try {
// //     const { id } = req.params;
// //     const data = await captainProfileService.getById(id);
// //     res.json({ status: "success", data });
// //   } catch (error) {
// //     res.status(error.status || 500).json({ status: "error", message: error.message });
// //   }
// // }

// // export async function getAllCaptainProfiles(req, res) {
// //   try {
// //     const { page, limit, is_active } = req.query;
// //     const data = await captainProfileService.list({
// //       page: Number(page),
// //       limit: Number(limit),
// //       is_active,
// //     });
// //     res.json({ status: "success", ...data });
// //   } catch (error) {
// //     res.status(error.status || 500).json({ status: "error", message: error.message });
// //   }
// // }

// // export async function updateCaptainProfile(req, res) {
// //   try {
// //     const payload = { id: Number(req.params.id), ...req.body };
// //     const data = await captainProfileService.update(payload);
// //     res.json({ status: "success", data });
// //   } catch (error) {
// //     res.status(error.status || 400).json({ status: "error", message: error.message });
// //   }
// // }

// // export async function deleteCaptainProfile(req, res) {
// //   try {
// //     const { id } = req.params;
// //     const result = await captainProfileService.remove(id);
// //     res.json({ status: "success", ...result });
// //   } catch (error) {
// //     res.status(error.status || 400).json({ status: "error", message: error.message });
// //   }
// // }

// // export async function restoreCaptainProfile(req, res) {
// //   try {
// //     const { id } = req.params;
// //     const result = await captainProfileService.restore(id);
// //     res.json({ status: "success", data: result });
// //   } catch (error) {
// //     res.status(error.status || 400).json({ status: "error", message: error.message });
// //   }
// // }



// import captainProfileService from "../service/captain_profile.service.js";
// import {
//   CaptainProfileCreateSchema,
//   CaptainProfileUpdateSchema,
// } from "../dto/captain_profile.dto.js";
// import { z } from "zod";

// // Params schema
// const captainProfileIdSchema = z.object({
//   id: z.string().regex(/^\d+$/, "ID must be a number"),
// });

// // Query schema
// const getCaptainProfilesQuerySchema = z.object({
//   page: z.string().regex(/^\d+$/, "Page must be a number").optional(),
//   limit: z.string().regex(/^\d+$/, "Limit must be a number").optional(),
//   is_active: z.string().transform((v) => v === "true").optional(),
// });

// // Create
// export const createCaptainProfileController = async (req, res) => {
//   try {
//      console.log("Authenticated captain:", req.captain);
//     const captainId = req.captain?.id;

//     if (!captainId) {
//       return res.status(401).json({ error: "Unauthorized: Missing captain_id" });
//     }

//     // Validate and merge
//     const validatedBody = CaptainProfileCreateSchema.parse({
//       ...req.body,
//       captain_id: captainId,
//     });

//     const profile = await captainProfileService.create(validatedBody);

//     return res.status(201).json({
//       message: "Captain profile created successfully.",
//       data: profile,
//     });
//   } catch (error) {
//     console.error("Create Captain Profile Error:", error);
//     const statusCode = error.name === "ZodError" ? 422 : 400;
//     return res.status(statusCode).json({
//       error: error.errors?.[0]?.message || error.message,
//     });
//   }
// };



// export const getAllCaptainProfilesController = async (req, res) => {
//   try {
//     const validatedQuery = getCaptainProfilesQuerySchema.parse(req.query);

//     const user = req.admin || req.captain;
//     if (!user) return res.status(401).json({ error: "Unauthorized" });

//     // Attach role
//     user.role = req.admin ? 'Admin' : 'Captain';

//     const data = await captainProfileService.list({
//       page: Number(validatedQuery.page) || 1,
//       limit: Number(validatedQuery.limit) || 10,
//       is_active: validatedQuery.is_active,
//       requester: user,
//     });

//     // If captain, remove extra profiles, only send their own
//     if (user.role === "Captain") {
//       return res.status(200).json({
//         data: data.data[0] || null, // single profile
//       });
//     }

//     // If admin, send all with pagination
//     return res.status(200).json({ data });

//   } catch (error) {
//     console.error("Get All Captain Profiles Error:", error);
//     const statusCode = error.name === "ZodError" ? 422 : 500;
//     return res.status(statusCode).json({
//       error: error.errors?.[0]?.message || error.message || "Internal Server Error",
//     });
//   }
// };



// // Get by ID
// export const getCaptainProfileByIdController = async (req, res) => {
//   try {
//     const { id } = captainProfileIdSchema.parse(req.params); 
//     const profile = await captainProfileService.getById(id);

//     return res.status(200).json({ data: profile });
//   } catch (error) {
//     console.error("Get Captain Profile by ID Error:", error);

//     let statusCode = 500;
//     let errorMessage = "Internal Server Error";

//     if (error.name === "ZodError") {
//       statusCode = 422;
//       errorMessage = error.errors?.[0]?.message || "Validation error";
//     } else if (error.message.includes("Profile not found")) {
//       statusCode = 404;
//       errorMessage = "Captain profile not found.";
//     }

//     return res.status(statusCode).json({ error: errorMessage });
//   }
// };

// // Update
// export const updateCaptainProfileController = async (req, res) => {
//   try {
//     const { id } = captainProfileIdSchema.parse(req.params);
//     const payload = CaptainProfileUpdateSchema.parse({ id: Number(id), ...req.body });

//     const currentUser = req.admin || req.captain || req.user;
//     const updatedProfile = await captainProfileService.update({
//       ...payload,
//       updated_by: currentUser?.id,
//     });

//     return res.status(200).json({
//       message: "Captain profile updated successfully.",
//       data: updatedProfile,
//     });
//   } catch (error) {
//     console.error("Update Captain Profile Error:", error);

//     const statusCode =
//       error.name === "ZodError"
//         ? 422
//         : error.message.includes("Unauthorized")
//           ? 401
//           : error.message.includes("Profile not found")
//             ? 404
//             : 400;

//     return res.status(statusCode).json({
//       error: error.errors?.[0]?.message || error.message,
//     });
//   }
// };

// // Soft Delete
// export const softDeleteCaptainProfileController = async (req, res) => {
//   try {
//     const { id } = captainProfileIdSchema.parse(req.params);
//     const result = await captainProfileService.remove(id);

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error("Soft Delete Captain Profile Error:", error);

//     const statusCode =
//       error.name === "ZodError"
//         ? 422
//         : error.message.includes("Profile not found")
//           ? 404
//           : 400;

//     return res.status(statusCode).json({ error: error.message });
//   }
// };

// // Restore
// export const restoreCaptainProfileController = async (req, res) => {
//   try {
//     const { id } = captainProfileIdSchema.parse(req.params);
//     const result = await captainProfileService.restore(id);

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error("Restore Captain Profile Error:", error);

//     const statusCode =
//       error.name === "ZodError"
//         ? 422
//         : error.message.includes("Profile not found")
//           ? 404
//           : 400;

//     return res.status(statusCode).json({ error: error.message });
//   }
// };


// // src/app/captain_profile/controller/captain_profile.controller.js
// import captainProfileService from "../service/captain_profile.service.js";
// import { 
//   CaptainProfileCreateSchema,
//   CaptainProfileUpdateSchema,
//   getCaptainProfilesQuerySchema,
//   captainProfileIdSchema,
// } from "../dto/captain_profile.dto.js";




// export const createCaptainProfileController = async (req, res) => {
//   try {
//     const validatedBody = CaptainProfileCreateSchema.parse(req.body);
//     const profile = await captainProfileService.create(validatedBody);
//     res.status(201).json({ status: "success", data: profile });
//   } catch (error) {
//     console.error(error);
//     res.status(error.status || 500).json({ status: "error", message: error.message });
//   }
// };


// // GET list
// export const getAllCaptainProfilesController = async (req, res) => {
//   try {
//     const validatedQuery = getCaptainProfilesQuerySchema.parse(req.query);
//     const user = req.admin || req.captain;
//     if (!user) return res.status(401).json({ status: "error", message: "Unauthorized" });

//     user.role = req.admin ? "Admin" : "Captain";
//     if (user.role === "Captain") user.captain_id = req.captain.id;

//     const data = await captainProfileService.list({
//       page: Number(validatedQuery.page) || 1,
//       limit: Number(validatedQuery.limit) || 10,
//       is_active: validatedQuery.is_active,
//       search: validatedQuery.search,
//       requester: user,
//     });

//     return res.status(200).json({ data: user.role === "Captain" ? data.data[0] || null : data });
//   } catch (error) {
//     console.error(error);
//     return res.status(error.status || 500).json({ status: "error", message: error.message });
//   }
// };

// // GET by ID
// export const getCaptainProfileByIdController = async (req, res) => {
//   try {
//     const { id } = captainProfileIdSchema.parse(req.params);
//     const user = req.admin || req.captain;
//     if (!user) return res.status(401).json({ status: "error", message: "Unauthorized" });

//     user.role = req.admin ? "Admin" : "Captain";
//     if (user.role === "Captain" && user.captain_id !== id) return res.status(403).json({ status: "error", message: "Access denied" });

//     const profile = await captainProfileService.getById(id);
//     return res.status(200).json({ data: profile });
//   } catch (error) {
//     console.error(error);
//     return res.status(error.status || 500).json({ status: "error", message: error.message });
//   }
// };

// export const updateCaptainProfileController = async (req, res) => {
//   try {
//     const { id } = captainProfileIdSchema.parse(req.params); // captain_user.id
//     const updates = CaptainProfileUpdateSchema.parse(req.body);

//     // user info from auth middleware
//     const user = req.admin || req.captain;
//     if (!user) {
//       return res.status(401).json({ status: "error", message: "Unauthorized" });
//     }

//     // determine role
//     const role = req.admin ? "Admin" : "Captain";

//     // captains can only update their own profile
//     if (role === "Captain" && user.id !== id) {
//       return res.status(403).json({ status: "error", message: "Access denied" });
//     }

//     const updatedProfile = await captainProfileService.update(id, {
//       ...updates,
//       updated_by: user.id,
//     });

//     return res.status(200).json({ 
//       status: "success",
//       message: "Profile updated successfully",
//       data: updatedProfile 
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(error.status || 500)
//       .json({ status: "error", message: error.message });
//   }
// };



// // DELETE
// export const removeCaptainProfileController = async (req, res) => {
//   try {
//     const { id } = captainProfileIdSchema.parse(req.params);
//     if (!req.admin) return res.status(401).json({ status: "error", message: "Only admin can delete profiles" });

//     const result = await captainProfileService.remove(id);
//     return res.status(200).json({ data: result });
//   } catch (error) {
//     console.error(error);
//     return res.status(error.status || 500).json({ status: "error", message: error.message });
//   }
// };

// // RESTORE
// export const restoreCaptainProfileController = async (req, res) => {
//   try {
//     const { id } = captainProfileIdSchema.parse(req.params);
//     if (!req.admin) return res.status(401).json({ status: "error", message: "Only admin can restore profiles" });

//     const restored = await captainProfileService.restore(id);
//     return res.status(200).json({ data: restored });
//   } catch (error) {
//     console.error(error);
//     return res.status(error.status || 500).json({ status: "error", message: error.message });
//   }
// };



// src/app/captain_profile/controller/captain_profile.controller.js
import captainProfileService from "../service/captain_profile.service.js";
import {
  CaptainProfileCreateSchema,
  CaptainProfileUpdateSchema,
  getCaptainProfilesQuerySchema,
  captainProfileIdSchema,
} from "../dto/captain_profile.dto.js";

/**
 * Create a new captain profile
 */
export const createCaptainProfileController = async (req, res) => {
  try {
    const validatedBody = CaptainProfileCreateSchema.parse(req.body);
    const profile = await captainProfileService.create(validatedBody);
    return res.sendSuccess(profile, "Captain profile created successfully");
  } catch (error) {
    console.error(error);
    if (error.name === "ZodError") {
      return res.sendError("Validation error", 422, error.errors);
    }
    return res.sendError(error.message || "Internal Server Error", error.status || 500);
  }
};

/**
 * Get all captain profiles (Admin) or own profile (Captain)
 */
export const getAllCaptainProfilesController = async (req, res) => {
  try {
    const validatedQuery = getCaptainProfilesQuerySchema.parse(req.query);
    const user = req.admin || req.captain;

    if (!user) return res.sendError("Unauthorized", 401);

    user.role = req.admin ? "Admin" : "Captain";
    if (user.role === "Captain") user.captain_id = req.captain.id;

    const data = await captainProfileService.list({
      page: Number(validatedQuery.page) || 1,
      limit: Number(validatedQuery.limit) || 10,
      is_active: validatedQuery.is_active,
      search: validatedQuery.search,
      requester: user,
    });

    const responseData = user.role === "Captain" ? data.data[0] || null : data;

    return res.sendSuccess(responseData, "Captain profiles retrieved successfully");
  } catch (error) {
    console.error(error);
    if (error.name === "ZodError") {
      return res.sendError("Invalid query parameters", 422, error.errors);
    }
    return res.sendError(error.message || "Internal Server Error", error.status || 500);
  }
};

/**
 * Get a captain profile by ID
 */
export const getCaptainProfileByIdController = async (req, res) => {
  try {
    const { id } = captainProfileIdSchema.parse(req.params);
    const user = req.admin || req.captain;

    if (!user) return res.sendError("Unauthorized", 401);

    user.role = req.admin ? "Admin" : "Captain";
    if (user.role === "Captain" && user.captain_id !== id) {
      return res.sendError("Access denied", 403);
    }

    const profile = await captainProfileService.getById(id);
    if (!profile) return res.sendError("Captain profile not found", 404);

    return res.sendSuccess(profile, "Captain profile retrieved successfully");
  } catch (error) {
    console.error(error);
    if (error.name === "ZodError") {
      return res.sendError("Invalid ID parameter", 422, error.errors);
    }
    return res.sendError(error.message || "Internal Server Error", error.status || 500);
  }
};

/**
 * Update captain profile
 */
// export const updateCaptainProfileController = async (req, res) => {
//   try {
//     const { id: captainId } = captainProfileIdSchema.parse(req.params);
//     const updates = CaptainProfileUpdateSchema.parse(req.body);

//     const { admin, captain } = req;

//     if (!admin && !captain) {
//       return res.sendError("Unauthorized", 401);
//     }

//     if (captain && captain.id !== captainId) {
//       return res.sendError("Access denied", 403);
//     }

//     const updatedProfile = await captainProfileService.update(captainId, {
//       ...updates,
//       updated_by: (admin || captain).id,
//     });

//     return res.sendSuccess(updatedProfile, "Captain profile updated successfully");
//   } catch (error) {
//     console.error(error);

//     if (error.name === "ZodError") {
//       return res.sendError("Validation error", 422, error.errors);
//     }
//     if (error.status === 404) {
//       return res.sendError("Captain profile not found", 404);
//     }

//     return res.sendError(error.message || "Internal Server Error", error.status || 500);
//   }
// };


// controller.js

export const updateCaptainProfileController = async (req, res) => {
  try {
    const { id: profileId } = captainProfileIdSchema.parse(req.params); // ✅ profile id
    const updates = CaptainProfileUpdateSchema.parse(req.body);

    const { admin, captain } = req;

    if (!admin && !captain) {
      return res.sendError("Unauthorized", 401);
    }

    // Fetch profile first to verify ownership
    // const profile = await CaptainProfile.findOne({ where: { id: profileId } });
    // if (!profile) return res.sendError("Captain profile not found", 404);
      const profile = await captainProfileService.getById(profileId);

    if (captain && profile.captain_id !== captain.id) {
      return res.sendError("Access denied", 403);
    }

    const updatedProfile = await captainProfileService.update(profileId, {
      ...updates,
      updated_by: (admin || captain).id,
    });

    return res.sendSuccess(updatedProfile, "Captain profile updated successfully");
  } catch (error) {
    console.error(error);
    if (error.name === "ZodError") {
      return res.sendError("Validation error", 422, error.errors);
    }
    if (error.status === 404) {
      return res.sendError("Captain profile not found", 404);
    }
    return res.sendError(error.message || "Internal Server Error", error.status || 500);
  }
};



/**
 * Soft delete captain profile (Admin only)
 */
export const removeCaptainProfileController = async (req, res) => {
  try {
    const { id } = captainProfileIdSchema.parse(req.params);
    if (!req.admin) return res.sendError("Only admin can delete profiles", 401);

    const result = await captainProfileService.remove(id);
    return res.sendSuccess(result, "Captain profile deleted successfully");
  } catch (error) {
    console.error(error);
    if (error.status === 404) return res.sendError("Captain profile not found", 404);
    return res.sendError(error.message || "Internal Server Error", error.status || 500);
  }
};

/**
 * Restore soft-deleted captain profile (Admin only)
 */
export const restoreCaptainProfileController = async (req, res) => {
  try {
    const { id } = captainProfileIdSchema.parse(req.params);
    if (!req.admin) return res.sendError("Only admin can restore profiles", 401);

    const restored = await captainProfileService.restore(id);
    return res.sendSuccess(restored, "Captain profile restored successfully");
  } catch (error) {
    console.error(error);
    if (error.status === 404) return res.sendError("Captain profile not found", 404);
    return res.sendError(error.message || "Internal Server Error", error.status || 500);
  }
};

export const getCaptainProfileCompletionController = async (req, res) => {
  try {
    const captain_id = req.params.captain_id || req.captain?.id;

    if (!captain_id) {
      return res.sendError("Captain ID is required", 400);
    }

    // ✅ FIX: use the correct service function name
    const result = await captainProfileService.getProfileCompletion(captain_id);

    return res.sendSuccess(
      result,
      "Captain profile completion percentage fetched successfully"
    );
  } catch (err) {
    console.error("❌ Error in getCaptainProfileCompletionController:", err);
    return res.sendError(err.message || "Failed to calculate profile completion", 500);
  }
};