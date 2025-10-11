import { z } from 'zod';

export const checkinTypeEnum = z.enum(['checkin', 'checkout']);

export const locationSchema = z.object({
  latitude: z.string().min(1, 'Latitude is required'),
  longitude: z.string().min(1, 'Longitude is required'),
});

export const createCheckinSchema = z.object({
  type: checkinTypeEnum,
  location: locationSchema,
  is_active: z.boolean().optional(),
});

export const updateCheckinSchema = z.object({
  type: checkinTypeEnum.optional(),
  location: locationSchema.optional(),
  is_active:z. boolean(). optional(),
});
