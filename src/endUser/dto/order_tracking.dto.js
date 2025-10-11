import { z } from 'zod';

/**
 * DTO and validation schemas for OrderTracking endpoints
 */

// Base schema for creating/updating
const baseOrderTrackingSchema = z.object({
  payment_id: z.string({
    required_error: 'payment_id is required',
    invalid_type_error: 'payment_id must be a number',
  }),
  status: z.enum(['Processing', 'Packing', 'Fulfilment']).optional(),
  user_id: z.string().uuid({ message: 'user_id must be a valid UUID' }).optional(),
  delivery_address_id: z.number({invalid_type_error: 'delivery_address_id must be a number'})
});

export const createOrderTrackingSchema = {
  body: baseOrderTrackingSchema,
};

export const updateOrderTrackingSchema = {
  body: baseOrderTrackingSchema.partial(),
};

export const listOrderTrackingsSchema = {
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'page must be a number')
      .transform((val) => parseInt(val, 10))
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'limit must be a number')
      .transform((val) => parseInt(val, 10))
      .optional(),
    status: z.enum(['Processing', 'Packing', 'Fulfilment']).optional(),
    user_id: z.string().uuid().optional(),
    payment_id: z
      .string()
      .regex(/^\d+$/, 'payment_id must be a number')
      .transform((val) => parseInt(val, 10))
      .optional(),
    orderBy: z.string().optional(),
    order: z.enum(['ASC', 'DESC']).optional(),
  }),
};

// Params schema for routes with :id
export const orderTrackingIdSchema = {
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'id must be a number')
      .transform((val) => parseInt(val, 10)),
  }),
};
