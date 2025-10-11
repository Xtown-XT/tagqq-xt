import { z } from 'zod';

export const createDeliveryAddressSchema = {
  body: z.object({
    user_id: z.string().uuid().optional(),
    address1: z.string().min(5).max(255),
    address2: z.string().max(255).optional(),
    district: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    country: z.string().min(2).max(100),
    pincode: z.number().int().min(100000).max(999999),
    createdBy: z.string().uuid().optional(),
    updatedBy: z.string().uuid().optional(),
  })
};

export const updateDeliveryAddressSchema = {
  body: z.object({
    address1: z.string().min(5).max(255).optional(),
    address2: z.string().max(255).optional(),
    district: z.string().min(2).max(100).optional(),
    state: z.string().min(2).max(100).optional(),
    country: z.string().min(2).max(100).optional(),
    pincode: z.number().int().min(100000).max(999999).optional(),
    // updatedBy: z.string().uuid().optional(),
  })
};
