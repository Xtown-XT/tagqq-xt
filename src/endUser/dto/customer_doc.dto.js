import { z } from 'zod';

export const createCustomerDocSchema = {
  body: z.object({
    user_id: z.string().uuid().optional(),
    doc_type: z.enum(['license', 'aadhar','pancard','passport','insurance', 'registration', 'idproof', 'others']),
    doc_name: z.string().max(50).optional(),
    remarks: z.string().max(200).optional(),
    createdBy: z.string().uuid().optional(),
    updatedBy: z.string().uuid().optional(),
  })
};

export const updateCustomerDocSchema = {
  body: z.object({
    user_id: z.string().uuid().optional(),
    doc_type: z.enum(['license', 'aadhar','pancard','passport','insurance', 'registration', 'idproof', 'others']).optional(),
    doc_name: z.string().max(50).optional(),
    // doc_blob: z.string().optional(),
    // mime_type: z.string().optional(),
    // file_size: z.number().max(2.0).optional(),
    remarks: z.string().max(200).optional(),  
  })
};