import { z } from 'zod';

export const createCountrySchema = {
  body: z.object({
    name: z.string().max(50, 'Name must be under 50 characters'),
    is_active: z.boolean().optional(),
    created_by: z.number().optional()
  })
};

export const updateCountrySchema = {
  body: z.object({
    name: z.string().max(50, 'Name must be under 50 characters').optional(),
    is_active: z.boolean().optional(),
    updated_by: z.number().optional()
  })
};
