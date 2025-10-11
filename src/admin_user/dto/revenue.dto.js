import { z } from 'zod';
import dayjs from 'dayjs';

const today = dayjs().format('YYYY-MM-DD');

export const orderStatsQuerySchema = z.object({
  startDate: z
    .string()
    .optional()
    .default(today)
    .refine((date) => dayjs(date, 'YYYY-MM-DD', true).isValid(), {
      message: 'Invalid startDate format. Expected YYYY-MM-DD',
    }),
  endDate: z
    .string()
    .optional()
    .default(today)
    .refine((date) => dayjs(date, 'YYYY-MM-DD', true).isValid(), {
      message: 'Invalid endDate format. Expected YYYY-MM-DD',
    }),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  status: z.string().optional(),
});
