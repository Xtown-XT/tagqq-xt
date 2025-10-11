import { createApiKeySchema, updateApiKeySchema, getAllApiKeysSchema, idParamSchema } from "../dto/apiKey.schemas.js";
import APIkeyService from "../service/apiKey.service.js";
import { ZodError } from "zod";

export async function createApiKey(req, res) {
  try {
    const parsed = createApiKeySchema.body.parse(req.body);
    const apiKey = await APIkeyService.createAPIkey(parsed);
    return res.sendSuccess(apiKey, "API key created successfully");
  } catch (err) {
    if (err instanceof ZodError) {
      return res.sendError("Validation failed", 422, err.issues);
    }
    return res.sendError(err.message);
  }
}

export async function getAllApiKeys(req, res) {
  try {
    console.log("Fetching all API keys with query:", req.query);

    // Validate and parse query parameters
    const parsed = getAllApiKeysSchema.query.parse(req.query);

    // Call service method with parsed params
    const result = await APIkeyService.getAllAPIkeys(parsed);

    // Success response
    return res.sendSuccess(result, "API keys fetched successfully");
    
  } catch (err) {
    // Handle Zod validation errors
    if (err instanceof ZodError) {
      return res.sendError("Validation failed", 422, err.issues);
    }

    // Handle any other errors
    return res.sendError(err.message);
  }
}
export async function getApiKeyById(req, res) {
  try {
    const parsed = idParamSchema.params.parse(req.params);
    const apiKey = await APIkeyService.getAPIkeyById(parsed.id);
    return res.sendSuccess(apiKey, "API key fetched successfully");
  } catch (err) {
    if (err instanceof ZodError) {
      return res.sendError("Invalid ID parameter", 422, err.issues);
    }
    return res.sendError(err.message);
  }
}

export async function updateApiKeyById(req, res) {
  try {
    const { id } = idParamSchema.params.parse(req.params);
    const updateData = updateApiKeySchema.body.parse(req.body);
    const updated = await APIkeyService.updateAPIkeyById(id, updateData);
    return res.sendSuccess(updated, "API key updated successfully");
  } catch (err) {
    if (err instanceof ZodError) {
      return res.sendError("Validation failed", 422, err.issues);
    }
    return res.sendError(err.message);
  }
}

export async function deleteApiKeyById(req, res) {
  try {
    const { id } = idParamSchema.params.parse(req.params);
    const msg = await APIkeyService.deleteAPIkeyById(id);
    return res.sendSuccess(msg, "API key deleted successfully");
  } catch (err) {
    if (err instanceof ZodError) {
      return res.sendError("Invalid ID parameter", 422, err.issues);
    }
    return res.sendError(err.message);
  }
}