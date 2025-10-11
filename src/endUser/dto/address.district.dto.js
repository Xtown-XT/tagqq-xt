import { z } from 'zod';

export const createDistrictSchema = {
  body: z.object({
    name: z.string().max(50, 'Name must be under 50 characters'),
    state_id: z.number({
      required_error: 'State ID is required'
    }),
    is_active: z.boolean().optional(),
    created_by: z.string().uuid().optional()
  })
};

export const updateDistrictSchema = {
  body: z.object({
    name: z.string().max(50, 'Name must be under 50 characters').optional(),
    state_id: z.number().optional(),
    is_active: z.boolean().optional(),
    updated_by: z.string().uuid().optional()
  })
};
