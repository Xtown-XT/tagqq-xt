import { z } from 'zod';

// Schema for registering a new admin user
export const adminRegisterSchema = {
  body: z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6).max(255),
    phone: z.string().regex(/^\d{10,15}$/),
    role: z.enum(['Admin', 'Super Admin', 'Support Team'])
  }),
};

// Schema for updating an existing admin user
export const updateAdminSchema = {
  body: z.object({
    admin_username: z.string().min(3).max(50).optional(),
    admin_email: z.string().email().optional(),
    password: z.string().min(6).max(255).optional(),
    admin_phone: z.string().regex(/^\d{10,15}$/).optional(),
    role: z.enum(['Admin', 'Super Admin', 'Support Team']).optional(),
  }),
};

// Schema for admin login
export const adminLoginSchema = {
  body: z.object({
    identifier: z
      .string()
      .min(3)
      .refine((val) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const isPhone = /^\d{10,15}$/.test(val);
        const isUsername = /^[a-zA-Z0-9_.-]{3,50}$/.test(val);
        return isEmail || isPhone || isUsername;
      }, {
        message: 'Identifier must be a valid email, phone number (10-15 digits), or username (3-50 chars)'
      }),
    password: z.string().min(6).max(255)
  }),
};
