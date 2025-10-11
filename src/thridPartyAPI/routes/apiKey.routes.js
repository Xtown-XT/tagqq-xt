import { createApiKeySchema, updateApiKeySchema, getAllApiKeysSchema, idParamSchema } from "../dto/apiKey.schemas.js";
import { createApiKey, getAllApiKeys, getApiKeyById, updateApiKeyById, deleteApiKeyById } from "../controller/apiKey.controller.js";

import { Router } from "express";
import { validate } from "../../middleware/validate.js";
// import { isAuthenticated } from "../../middlewares/auth.js";




const router = Router();


// Create a new API key
router.post(
  "/apikeys",
//   isAuthenticated,
  validate(createApiKeySchema),
  createApiKey
);

// Get all API keys with pagination and search
router.get(
  "/apikeys",
//   isAuthenticated,
//   validate(getAllApiKeysSchema),
  getAllApiKeys
);

// Get an API key by ID
router.get(
  "/apikeys/:id",
//   isAuthenticated,
  validate(idParamSchema),
  getApiKeyById
);

// Update an API key by ID
router.put(
  "/apikeys/:id",
//   isAuthenticated,
  validate(updateApiKeySchema),
  updateApiKeyById
);

// Delete an API key by ID
router.delete(
  "/apikeys/:id",
//   isAuthenticated,
  validate(idParamSchema),
  deleteApiKeyById
);

export default router;