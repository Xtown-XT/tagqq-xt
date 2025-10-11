import { z } from 'zod';

/**
 * DTO and validation schemas for Profile endpoints
 */
// enum('Aadhar','RC','Profile','license','Emergency','captain_bank','captain_profile')
const baseProfileSchema = z.object({
  docs_name: z.enum(['Aadhar', 'RC', 'Profile', 'license', "Emergency", "captain_bank", "captain_profile"], {
    required_error: 'docs_name is required',
  }),
  data: z
  .preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return undefined; 
      }
    }
    return val;
  }, z.record(z.any()))
  .refine((obj) => typeof obj === 'object', { message: 'Invalid data object' }),
  user_id: z.string().uuid({ message: 'user_id must be a valid UUID' }).optional(),
  id_number: z.string().optional(),
  profile_image: z
    .string()
    .optional()
    .nullable(),
});

export const createProfileSchema = {
  body: baseProfileSchema.extend({
    created_by: z.string().uuid().optional(),
  }),
};

export const updateProfileSchema = {
  body: baseProfileSchema.partial().extend({
    updated_by: z.string().uuid().optional(),
  }),
};

export const listProfilesSchema = {
  query: z.object({
    // 1️⃣ Optional UUID filter
    user_id: z.string().uuid().optional(),

    // 2️⃣ Coerce anything truthy/"true" → true, else false, default to false
    includeInactive: z
      .preprocess((val) => String(val) === 'true', z.boolean())
      .default(false),
  }),
};

export const profileIdSchema = {
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'id must be a number')
      .transform(val => parseInt(val, 10)),
  }),
};
