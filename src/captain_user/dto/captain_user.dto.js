import { z } from 'zod';

export const captainUserRegisterSchema = {
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name too long').optional(),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be a 10-digit number'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    aadhaar: z.string().regex(/^\d{12}$/, 'Aadhaar must be a 12-digit number').optional()
  })
};

export const captainUserLoginSchema = {
  body: z.object({
    identifier: z.string().min(1, 'Email or phone is required'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
};
