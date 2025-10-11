import { z } from 'zod';

/**
 * DTO and validation schemas for Public URL endpoints
 */

// Base schema for PublicUrl
const basePublicUrlSchema = z.object({
  user_id: z.string().uuid({ message: 'user_id must be a valid UUID' }).optional(),
  status: z.enum(['Paid', 'Expried', 'Not paid', 'Active', 'Inactive'], {
    required_error: 'status is required',
    invalid_type_error: 'status must be one of Paid, Expried, Not paid',
  }).optional(),
});


// Schema for creating an emergency user


export const createPublicUrlSchema = {
  body: basePublicUrlSchema.extend({
    created_by: z.string().uuid().optional(),
  }),
};

export const updatePublicUrlSchema = {
  body: z.object({
     status: z.enum(['Paid', 'Expried', 'Not paid', 'Active', 'Inactive'], {
    required_error: 'status is required',
    invalid_type_error: 'status must be one of Paid, Expried, Not paid',
  })
    
  })
};

export const listPublicUrlsSchema = {
  query: z.object({
    user_id: z.string().uuid().optional(),
    status: z.enum(['Paid', 'Expried', 'Not paid']).optional(),
    includeInactive: z
      .preprocess(val => String(val) === 'true', z.boolean())
      .default(false),
    page: z.preprocess(val => Number(val), z.number().int().positive().optional()),
    limit: z.preprocess(val => Number(val), z.number().int().positive().optional()),
    orderBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
};

export const publicUrlIdSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'id must be a valid UUID' }),
  }),
};


export const createEmergencyUserSchema = {
  params: publicUrlIdSchema.params,
  body: z.object({
    username: z.string().min(1, 'Username is required'),
    email: z.string().email('Must be a valid email'),
    phone: z.string().optional(),
    
  }),
};