// dtos/captain_withdraw.dto.js
import { z } from 'zod';

// Schema for creating a new Captain Withdraw Transaction
export const createCaptainWithdrawTransactionSchema = {
    body: z.object({
        // the authenticated captain_id will come from req.user, so we don't require it here
        sum_points: z
            .number({
                invalid_type_error: 'sum_points must be a number',
            })
            .min(0, 'sum_points cannot be negative')
            .optional(),

        point: z
            .number({
                required_error: 'point is required',
                invalid_type_error: 'point must be a number',
            })
            .min(0, 'point cannot be negative'),
        unit_of_amount: z
            .number({
                invalid_type_error: 'amount must be a number',
            })
            .min(0, 'amount cannot be negative')
        ,

        captain_id: z.string().uuid({ message: "Invalid captian ID" }).optional(),

        amount: z
            .number({
                required_error: 'amount is required',
                invalid_type_error: 'amount must be a number',
            })
            .min(0, 'amount cannot be negative'),

        payment_status: z
            .enum(['pending', 'processing', 'failed', 'completed'], {
                invalid_type_error: 'payment_status must be one of pending, processing, failed, completed',
            })
            .optional(), // defaults to 'pending' in the service/model
    }),
};

// Schema for updating an existing Captain Withdraw Transaction
export const updateCaptainWithdrawTransactionSchema = {
    body: z.object({
        sum_points: z
            .number({
                invalid_type_error: 'sum_points must be a number',
            })
            .min(0, 'sum_points cannot be negative')
        ,

        point: z
            .number({
                invalid_type_error: 'point must be a number',
            })
            .min(0, 'point cannot be negative')
        ,

        unit_of_amount: z
            .number({
                invalid_type_error: 'amount must be a number',
            })
            .min(0, 'amount cannot be negative')
        ,

        amount: z
            .number({
                invalid_type_error: 'amount must be a number',
            })
            .min(0, 'amount cannot be negative')
        ,

        payment_status: z
            .enum(['pending', 'processing', 'failed', 'completed'], {
                invalid_type_error: 'payment_status must be one of pending, processing, failed, completed',
            })
            .optional(),
    }),
};

// Schema for list/query parameters for Captain Withdraw Transactions
export const listCaptainWithdrawTransactionsSchema = {
    query: z.object({
        captainId: z
            .string()
            .uuid('captainId must be a valid UUID')
            .optional(),

        status: z
            .enum(['pending', 'processing', 'failed', 'completed'])
            .optional(),

        startDate: z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), {
                message: 'startDate must be a valid ISO date string',
            }),

        endDate: z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), {
                message: 'endDate must be a valid ISO date string',
            }),

        includeDeleted: z
            .string()
            .optional()
            .transform((val) => val === 'true'),

        page: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 1))
            .refine((n) => Number.isInteger(n) && n > 0, {
                message: 'page must be a positive integer',
            }),

        limit: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val, 10) : 20))
            .refine((n) => Number.isInteger(n) && n > 0, {
                message: 'limit must be a positive integer',
            }),
    }),
};
