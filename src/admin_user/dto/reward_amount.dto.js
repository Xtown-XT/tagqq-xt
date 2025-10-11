// import { z } from 'zod';

// export const rewardUpdateSchema = z.object({
//   params: z.object({
//     rewardId: z.string().uuid(),
//   }),
//   body: z.object({
//     status: z.enum(['Approved', 'Declined', 'Success'], {
//       required_error: 'status is required',
//     }),
//     remarks: z.string().max(150).optional(),
//     updated_by: z.string().uuid({
//       required_error: 'updated_by is required',
//     }),
//   }),
// });


// rewardAmount.schema.js
import { z } from 'zod';

export const rewardUpdateSchema = {
  params: z.object({
    rewardId: z.string().uuid({
      message: 'Invalid reward ID format',
    }),
  }),
  body: z.object({
    status: z.enum(['Approved', 'Declined', 'Success'], {
      required_error: 'status is required',
    }),
    remarks: z.string().max(150).optional(),
    // updated_by: z.string().uuid({
    //   required_error: 'updated_by is required',
    // }),
  }),
};
