// dtos/order.dto.js
import { z } from 'zod';

// export const createOrderSchema = {
//   body: z.object({
//     no_of_qr_ordered: z
//       .number({
//         required_error: 'Number of QR codes is required',
//         invalid_type_error: 'QR count must be a number'
//       })
//       .min(1, 'At least one QR code must be ordered'),
//     userAgent: z.object({

//     })
//   }),
// };

export const createOrderSchema = {
  body: z.object({
    no_of_qr_ordered: z
      .number({
        required_error: 'Number of QR codes is required',
        invalid_type_error: 'QR count must be a number',
      })
      .min(1, 'At least one QR code must be ordered'),
       view: z.boolean().optional().default(false),

    admin_id: z.string().uuid('Admin ID must be a valid UUID').optional(),

    userAgent: z.union([
      z.string().uuid('Agent ID must be a valid UUID'),
      z.object({
        id: z.string().uuid('Agent ID is required and must be a valid UUID'),
        name: z.string().optional(),
        partner_id: z.string().uuid().optional()
      }),
    ]).optional(),

    createdBy: z.string().uuid('createdBy must be a valid UUID').optional(),
    updatedBy: z.string().uuid('updatedBy must be a valid UUID').optional(),
  }),
};

export const updateOrderSchema = {
  body: z.object({
    no_of_qr_ordered: z
      .number({
        required_error: 'Number of QR codes is required',
        invalid_type_error: 'QR count must be a number',
      })
      .min(1, 'At least one QR code must be ordered').optional(),
    status: z.enum(['processing', 'delivered', 'fulfillment'], {
      required_error: 'Status is required',
      invalid_type_error: 'Invalid status value',
    }).optional(),
    view: z.boolean().optional(),
  }),
};
 
