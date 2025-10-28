import { z } from "zod";

export const StatusEnum = z.enum(["redeemed", "not_yet_redeemed"]);

export const createCaptainTransactionSchema = z.object({
  captain_id: z.string().uuid({ message: "Invalid captain ID" }),
  user_id: z.string().uuid({ message: "Invalid user ID" }),
  public_url_id: z.string().uuid({ message: "Invalid public URL ID" }),
  points: z.number().int().min(0, { message: "Points must be non-negative" }),
  status: StatusEnum.optional().default("not_yet_redeemed"),
  amount: z.number().int().min(0, { message: "Points must be non-negative" }),
});

export const createCaptainTransactionControllerSchema = z.object({
  //   captain_id: z.string().uuid({ message: "Invalid captain ID" }),
  user_id: z.string().uuid({ message: "Invalid user ID" }),
  public_url_id: z.string().uuid({ message: "Invalid public URL ID" }),
  points: z.number().int().min(0, { message: "Points must be non-negative" }),
  status: StatusEnum.optional().default("not_yet_redeemed"),
});

export const bulkCreateCaptainTransactionSchema = z.array(
  createCaptainTransactionSchema
);

export const bulkCreateCaptainTransactionControllerSchema = z.array(
  createCaptainTransactionSchema
);

export const updateCaptainTransactionSchema = z.object({
  id: z.string().uuid({ message: "Invalid transaction ID" }),
  captain_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  public_url_id: z.string().uuid().optional(),
  points: z.number().int().min(0).optional(),
  status: StatusEnum.optional(),
});

export const updateCaptainTransactionControllerSchema = z.object({
  //   id: z.string().uuid({ message: "Invalid transaction ID" }),
  //   captain_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  public_url_id: z.string().uuid().optional(),
  points: z.number().int().min(0).optional(),
  status: StatusEnum.optional(),
});

export const bulkUpdateCaptainTransactionSchema = z.array(
  updateCaptainTransactionSchema
);

export const bulkUpdateCaptainTransactionControllerSchema = z.array(
  updateCaptainTransactionSchema
);
export const getCaptainTransactionListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: StatusEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sort_by: z.string().optional(), // e.g., created_at, points
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  captain_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  is_master: z.string().optional(),
  export: z.string().optional()

});

export const getCaptainTransactionListControllerSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: StatusEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sort_by: z.string().optional(), // e.g., created_at, points
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  //   captain_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
});

export const getCaptainTransactionByIdSchema = z.object({
  id: z.string().uuid({ message: "Invalid transaction ID" }),
});

export const deleteCaptainTransactionSchema = z.object({
  id: z.string().uuid({ message: "Invalid transaction ID" }),
});

export const bulkDeleteCaptainTransactionSchema = z.object({
  ids: z.array(z.string().uuid({ message: "Invalid transaction ID in array" })),
});

export const restoreCaptainTransactionSchema = z.object({
  id: z.string().uuid({ message: "Invalid transaction ID" }),
});
