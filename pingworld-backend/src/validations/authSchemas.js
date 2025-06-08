import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required." }).min(1, { message: "Name cannot be empty." }),
    email: z.string({ required_error: "Email is required." }).email({ message: "Invalid email format." }),
    password: z
      .string({ required_error: "Password is required." })
      .min(6, { message: "Password must be at least 6 characters long." })
      .max(256, { message: "Password must be at most 256 characters long." }),
    tempUserId: z.string().uuid({ message: "Invalid temporary user ID format." }).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required." }).email({ message: "Invalid email format." }),
    password: z
      .string({ required_error: "Password is required." })
      .min(6, { message: "Password must be at least 6 characters long." })
      .max(256, { message: "Password must be at most 256 characters long." }),
  }),
});
