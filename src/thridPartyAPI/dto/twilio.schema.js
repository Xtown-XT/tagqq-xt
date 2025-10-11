import { z } from 'zod';

// Emergency Call Payload
export const emergencyCallSchema = z.object({
  location: z.string().min(1, "Location is required"),
  hospital: z.string().min(1, "Hospital is required"),
});

// Relay Call Payload
export const relayCallSchema = z.object({
  emergencyContact: z.string()
    .min(10, "Emergency contact number is required")
    .regex(/^\+91\d{10}$/, "Emergency contact must be a valid Indian phone number with +91"),

  victimPhone: z.string()
    .min(10, "Victim phone number is required")
    .regex(/^\+91\d{10}$/, "Victim phone must be a valid Indian phone number with +91"),

  name: z.string().min(1, "Name is required"),
  photo: z.string(),
  type: z.string().min(1, "Type is required"),
  location: z.string().min(1, "Location is required"),
  hospital: z.string().min(1, "Hospital is required"),
});


// Call ID Param
export const callIdParamSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
});
