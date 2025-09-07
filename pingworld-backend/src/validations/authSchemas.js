import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    user_name: z.string({ required_error: "User name is required." }).min(1, { message: "User name cannot be empty." }),
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

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: "Old password is required." }).min(6).max(256),
    newPassword: z.string({ required_error: "New password is required." }).min(6).max(256),
    newPasswordConfirm: z.string({ required_error: "New password confirmation is required." }).min(6).max(256),
  }),
});
