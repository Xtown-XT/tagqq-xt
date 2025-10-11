// src/app/captain_profile/dto/captain_profile.dto.js
import { z } from "zod";

// ID param
export const captainProfileIdSchema = z.object({
  id: z.string().uuid({ message: "ID must be a valid UUID" }),
});

// Personal details schema
const personalDetailsSchema = z.object({
  docs_name: z.literal("PersonalDetails"),
  data: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be YYYY-MM-DD"),
    gender: z.enum(["male", "female", "other"]),
    mobileNumber: z.string().min(10).max(15),
    email: z.string().email(),
    aadhaar: z.string().length(12, "Aadhaar must be 12 digits"),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      district: z.string().optional(),
      state: z.string().min(1),
      pincode: z.string().length(6, "Pincode must be 6 digits"),
    }),
  }),
});

// Bank details schema
const bankDetailsSchema = z.object({
  docs_name: z.literal("BankDetails"),
  data: z.object({
    accountHolderName: z.string().min(1),
    accountNumber: z.string().min(8),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
    bankName: z.string().min(1),
    branchName: z.string().optional(),
  }),
});

// Create DTO
export const CaptainProfileCreateSchema = z.object({
  captain_id: z.string().uuid({ message: "ID must be a valid UUID" }),
  is_active: z.boolean().default(true),
  created_by: z.string().uuid().optional(),
  personal_details: personalDetailsSchema.optional(),
  bank_details: bankDetailsSchema.optional(),
});


// Update DTO
export const CaptainProfileUpdateSchema = z.object({
  is_active: z.boolean().optional(),
  updated_by: z.string().uuid().optional(),

  personal_details: z
    .object({
      docs_name: z.string().optional(),
      data: z
        .object({
          firstName: z.string().min(1).optional(),
          lastName: z.string().min(1).optional(),
          dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be YYYY-MM-DD").optional(),
          gender: z.enum(["male", "female", "other"]).optional(),
          mobileNumber: z.string().min(10).max(15).optional(),
          email: z.string().email().optional(),
          aadhaar: z.string().length(12, "Aadhaar must be 12 digits").optional(),
          address: z
            .object({
              street: z.string().min(1).optional(),
              city: z.string().min(1).optional(),
              district: z.string().optional(),
              state: z.string().min(1).optional(),
              pincode: z.string().length(6, "Pincode must be 6 digits").optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),

  bank_details: z
    .object({
      docs_name: z.string().optional(),
      data: z
        .object({
          accountHolderName: z.string().min(1).optional(),
          accountNumber: z.string().min(8).optional(),
          ifscCode: z
            .string()
            .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code")
            .optional(),
          bankName: z.string().min(1).optional(),
          branchName: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});



// Query params for list
export const getCaptainProfilesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  is_active: z.boolean().optional(),
  search: z.string().optional(),
});



// Update DTO
// export const CaptainProfileUpdateSchema = z.object({
//   is_active: z.boolean().optional(),
//   updated_by: z.string().uuid().optional(),

//   personal_details: z
//     .object({
//       docs_name: z.string().optional(),
//       data: personalDetailsSchema.shape.data.partial(),
//     })
//     .optional(),

//   bank_details: z
//     .object({
//       docs_name: z.string().optional(),
//       data: bankDetailsSchema.shape.data.partial(),
//     })
//     .optional(),
// });
