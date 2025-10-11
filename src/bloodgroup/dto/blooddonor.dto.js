import { z } from 'zod';

export const createBloodDonorSchema = {
  body: z.object({
    name: z.string().max(100),
    is_available: z.boolean().optional(),
    mobile_no: z.string().max(15),
    report_incorrect_details: z.string().optional(),
    city: z.string().max(50).optional(),
    district_id: z.number().int(),
    blood_group_id: z.number().int()
  })
};

export const updateBloodDonorSchema = {
  body: z.object({
    name: z.string().max(100).optional(),
    is_available: z.boolean().optional(),
    mobile_no: z.string().max(15).optional(),
    report_incorrect_details: z.string().optional(),
    city: z.string().max(50).optional(),
    district_id: z.number().int().optional(),
    blood_group_id: z.number().int().optional()
  })
};

export const bulkUploadDonorsSchema = {
  body: z.array(
    z.object({
      name: z.string().max(100),
      is_available: z.boolean().optional(),
      mobile_no: z.string().max(15),
      report_incorrect_details: z.string().optional(),
      city: z.string().optional(),
      blood_group: z.string().max(10),
      district: z.string().max(50)
    })
  )
};