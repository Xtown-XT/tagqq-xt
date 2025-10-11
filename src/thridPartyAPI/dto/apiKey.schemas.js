import { z } from "zod";

// For creating an API key
export const createApiKeySchema = {
  body: z.object({
    name: z.enum(["quickekyc","whatapp","smtp", "twillo", "razorpay", "stripe","phonepe"]),
    keys: z.record(z.union([z.string(), z.number(), z.boolean()])),
  }),
};

// For getting all API keys with pagination and search


export const getAllApiKeysSchema = {
  query: z.object({
    limit: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().min(1).optional(),
    search: z.string().optional(),
  }),
};


// For getting or deleting an API key by ID
export const idParamSchema = {
  params: z.object({
    id: z.string(),  }),

};

// For updating an API key by ID
export const updateApiKeySchema = {
  params: idParamSchema.params,
  body: z.object({
    name: z.enum(["quickekyc","whatapp","smtp", "twillo", "razorpay", "stripe", "phonepe"]).optional(),
    keys: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field (name or keys) must be provided for update",
  }),
};
