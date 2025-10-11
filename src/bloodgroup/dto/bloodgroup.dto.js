import { z } from 'zod';

export const createBloodGroupSchema = {
  body: z.object({
    name: z.string().max(20, 'Name should be under 20 characters'),
    is_active: z.boolean().optional(),
    created_by: z.number().optional(),
    updated_by: z.number().optional()
  })
};

export const updateBloodGroupSchema = {
  body: z.object({
    name: z.string().max(20).optional(),
    is_active: z.boolean().optional(),
    updated_by: z.number().optional()
  })
};
