import { z } from "zod";

/* =====================================================
   AUTH VALIDATORS — Zod schemas
   Har schema ek API ke expected body-shape ko define karta hai.
   Validation-middleware isi schema se check karega.
===================================================== */

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().trim().optional(),
  userType: z.enum(["superAdmin", "subAdmin"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, "idToken is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const setPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const resetPasswordOtpSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

