import { z } from 'zod';

const allowedFields = ['poster1', 'poster2', 'poster3', 'poster4', 'poster5', 'poster6'];

export const getPosterQuerySchema = {
  query: z.object({
    fields: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        const split = val.split(',');
        return split.every((f) => allowedFields.includes(f));
      }, {
        message: 'Invalid fields. Allowed values are poster1 to poster6',
      }),
  }),
};


export const updatePosterParamSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Invalid poster ID' }),
  }),
};

export const updatePosterBodySchema = {
  body: z.object({}) // No body fields for file uploads — handled via `req.files`
};