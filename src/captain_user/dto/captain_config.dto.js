// dtos/captain_config.dto.js
import { z } from 'zod';

// Schema for creating a new Captain Config
export const createCaptainConfigSchema = {
  body: z.object({
    target: z
      .number({
        required_error: 'Target is required',
        invalid_type_error: 'Target must be a number',
      })
      .int('Target must be an integer')
      .min(0, 'Target cannot be negative'),

    point_per_sale: z
      .number({
        required_error: 'Points per sale is required',
        invalid_type_error: 'Points per sale must be a number',
      })
      .min(0, 'Points per sale cannot be negative'),

    point_per_rupee: z
      .number({
        required_error: 'Points per rupee is required',
        invalid_type_error: 'Points per rupee must be a number',
      })
      .min(0, 'Points per rupee cannot be negative'),

    bonus_percent: z
      .number({
        required_error: 'Bonus percent is required',
        invalid_type_error: 'Bonus percent must be a number',
      })
      .min(0, 'Bonus percent cannot be negative')
      .max(100, 'Bonus percent cannot exceed 100'),

    start_date: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'start_date must be a valid ISO date string',
      }),

    end_date: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'end_date must be a valid ISO date string',
      }),
  }),
};

// Schema for updating an existing Captain Config
export const updateCaptainConfigSchema = {
  body: z.object({
    target: z
      .number()
      .int('Target must be an integer')
      .min(0, 'Target cannot be negative')
      .optional(),

    point_per_sale: z
      .number()
      .min(0, 'Points per sale cannot be negative')
      .optional(),

    point_per_rupee: z
      .number()
      .min(0, 'Points per rupee cannot be negative')
      .optional(),

    bonus_percent: z
      .number()
      .min(0, 'Bonus percent cannot be negative')
      .max(100, 'Bonus percent cannot exceed 100')
      .optional(),

    start_date: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'start_date must be a valid ISO date string',
      }),

    end_date: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'end_date must be a valid ISO date string',
      }),

    updated_by: z
      .string()
      .uuid('updated_by must be a valid UUID')
      .optional(),
  }),
};

// Schema for list/query parameters for Captain Configs
// export const listCaptainConfigSchema = {
//   query: z.object({
//     includeDeleted: z
//       .string()
//       .optional()
//       .transform((val) => val === 'true'),

//     startDate: z
//       .string()
//       .optional()
//       .refine((val) => !val || !isNaN(Date.parse(val)), {
//         message: 'startDate must be a valid ISO date string',
//       }),

//     endDate: z
//       .string()
//       .optional()
//       .refine((val) => !val || !isNaN(Date.parse(val)), {
//         message: 'endDate must be a valid ISO date string',
//       }),

//     page: z
//       .string()
//       .optional()
//       .transform((val) => (val ? parseInt(val, 10) : undefined)),

//     limit: z
//       .string()
//       .optional()
//       .transform((val) => (val ? parseInt(val, 10) : undefined)),
//   }),
// };
