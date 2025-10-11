import { z } from 'zod';

export const createStateSchema = {
  body: z.object({
    name: z.string().max(50, 'Name must be under 50 characters'),
    country_id: z.number({
      required_error: 'Country ID is required'
    }),
    is_active: z.boolean().optional(),
    created_by: z.number().optional()
  })
};

export const updateStateSchema = {
  body: z.object({
    name: z.string().max(50, 'Name must be under 50 characters').optional(),
    country_id: z.number().optional(),
    is_active: z.boolean().optional(),
    updated_by: z.number().optional()
  })
};
