import { z } from 'zod';

const suggestionSchema = z.object({
  docs_name: z.literal('Suggestions'),
  data: z.object({
    type: z.string().min(1, 'Type is required'),
    subject: z.string().min(1, 'Subject is required'),
    description: z.string().min(1, 'Description is required'),
  }),
});

const issueSchema = z.object({
  docs_name: z.literal('Issues'),
  data: z.object({
    type: z.string().min(1, 'Type is required'),
    description: z.string().min(1, 'Description is required'),
    logs: z.string().min(1, 'Logs are required'),
  }),
});

export const createEnhancementSchema = z.union([suggestionSchema, issueSchema]);

export const getEnhancementsQuerySchema = z.object({
  docs_name: z.enum(['Suggestions', 'Issues']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['processing', 'addressed', 'cleared']).optional(),
  month: z.string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format")
    .optional(),
  submitter_id: z.string().uuid('Invalid submitter ID format').optional(),
});

export const enhancementIdSchema = z.object({
  id: z.string().uuid('Invalid enhancement ID format'),
});
