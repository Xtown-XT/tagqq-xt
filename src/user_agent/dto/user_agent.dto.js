import { z } from 'zod';

export const userAgentRegisterSchema = {
  body: z.object({
    useragent_name: z.string().min(3).max(50),
    email: z.string().email(),
    phone: z.string().regex(/^\d{10}$/),
    password: z.string().min(6).optional(),
    partner_id: z.string().uuid().optional(),
    role: z.enum(['Admin', 'User'])
  })
};

export const userAgentLoginSchema = {
  body: z.object({
    identifier: z.string().min(1, 'Email or phone is required'),
    password: z.string().min(6, 'Password must be atleast 6 characters long')
  })
};
