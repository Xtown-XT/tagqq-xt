import { z } from "zod";

export const createRazorpayOrderSchema = {
  body: z.object({
    amount: z
      .number()
      .int()
      .positive({ message: "Amount must be a positive integer" })
      .optional()      // makes it OK to omit
      .default(100),
    currency: z.string().min(1).default("INR"),
    user_id: z.string().uuid({ message: "Invalid user_id format" }).optional(),
    user_type: z.enum(["USER", "AGENT", "ADMIN"], {
      message: "User type must be USER, AGENT, or ADMIN",
    }),
    agent_id: z.string().uuid({ message: "Invalid agent_id format" }).optional(),
    payment_method: z.string().min(1, { message: "Payment method is required" }).optional(),
    qrid: z.string().uuid(),
  }),
};

export const verifyRazorpayPaymentSchema = {
  body: z.object({
    razorpay_order_id: z.string().min(1, { message: "razorpay_order_id is required" }),
    razorpay_payment_id: z.string().min(1, { message: "razorpay_payment_id is required" }),
    razorpay_signature: z.string().min(1, { message: "razorpay_signature is required" }),
    delivery_address_id: z.number().int().positive().optional(),
    count_of_qr: z.number().int().positive().default(1).optional(),
    qrid: z.string().uuid(),
  }),
};

export const getPaymentByIdSchema = {
  params: z.object({
    id: z.string().uuid({ message: "Invalid payment ID format" }),
  }),
};

export const createUPIPaymentSchemaV2 = {
  body: z.object({
    customerDetails: z.object({
      id: z.string().uuid({ message: "Invalid customer ID" }),
    }).required(),
    amount: z.number().int().positive({ message: "Amount must be a positive integer (in paise)" }),
    agentDetails: z.object({
      id: z.string().uuid({ message: "Invalid agent ID" }),
      name: z.string().min(1, { message: "Agent name is required" }),
    }).required(),
  }),
};

export const createUPIPaymentSchema = {
  body: z.object({
    customerDetails: z
      .object({
        id: z.string().uuid({ message: "Invalid customer ID" }).optional(),
        name: z.string().min(1, { message: "Customer name is required" }).optional(),
        email: z.string().email({ message: "Invalid email" }).optional(),
        phone: z
          .string()
          .regex(/^\d{10}$/, { message: "Phone must be a 10-digit number" })
          .optional(),
      })
      .optional(),
    amount: z
      .number()
      .int()
      .positive({ message: "Amount must be a positive integer (in paise)" }),
    agentDetails: z
      .object({
        id: z.string().uuid({ message: "Invalid agent ID" }),
        name: z.string().min(1, { message: "Agent name is required" }),
      })
      .required(),
  }),
};


export const closeUPIPaymentSchema = {
  params: z.object({
    upiPaymentId: z.string().uuid({ message: "Invalid UPI Payment ID format" }),
  }),
};

export const fetchUPIPaymentSchema = {
  params: z.object({
    upiPaymentId: z.string().uuid({ message: "Invalid UPI Payment ID format" }),
  }),
};

export const fetchUPIPaymentsByCustomerSchema = {
  params: z.object({
    customerId: z.string().uuid({ message: "Invalid customer ID format" }),
  }),
};

export const fetchUPIPaymentsByPaymentIdSchema = {
  params: z.object({
    paymentId: z.string().uuid({ message: "Invalid payment ID format" }),
  }),
};
