import { z } from 'zod';

/**
 * DTO and validation schemas for Partner endpoints
 */

// Base schema for partner payloads
const basePartnerSchema = z.object({
  partner_type: z.enum(['showroom', 'workshop', 'delivery_partner', 'ambulance'], {
    required_error: 'partner_type is required',
  }),
  name: z.string({ required_error: 'name is required' }),
  address1: z.string({ required_error: 'address1 is required' }).min(1),
  address2: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string({ required_error: 'phone is required' }).min(6).max(15),
  email: z.string({ required_error: 'email is required' }).email(),
  gst_in: z.string().optional(),
  udyog_aadhar: z.string().optional(),
  rc: z.string().optional(),
});

// Create partner DTO
export const createPartnerSchema = {
  body: basePartnerSchema.extend({
    createdBy: z.string().uuid().optional(),
    updatedBy: z.string().uuid().optional(),
  }),
};

// Update partner DTO (all fields optional except will validate if provided)
export const updatePartnerSchema = {
  body: basePartnerSchema.partial().extend({
    updatedBy: z.string().uuid().optional(),
  }),
};

// List partners query parameters
// export const listPartnersSchema = {
//   query: z.object({
//     includeInactive: z
//       .preprocess((val) => String(val) === 'true', z.boolean())
//       .default(false),
//     is_active: z
//       .preprocess((val) => {
//         if (val === 'true') return true;
//         if (val === 'false') return false;
//         return val;
//       }, z.union([z.boolean(), z.undefined()])),
//     partner_type: z.enum(['showroom', 'workshop', 'delivery_partner', 'ambulance']).optional(),
//     search: z.string().optional(),
//     page: z.preprocess((val) => parseInt(val as string, 10), z.number().int().positive()).optional(),
//     limit: z.preprocess((val) => parseInt(val as string, 10), z.number().int().positive()).optional(),
//     orderBy: z.string().optional(),
//     order: z.enum(['asc', 'desc']).optional(),
//   }),
// };

// Partner ID param schema (UUID)
export const partnerIdSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'id must be a valid UUID' }),
  }),
};
