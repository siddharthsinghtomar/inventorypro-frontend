import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const onboardingSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  currency: z.string().default("INR"),
  timezone: z.string().default("Asia/Kolkata"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const registerTenantSchema = z.object({
  name: z.string().optional(),
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.string().optional(),
  slug: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional(),
  gstNumber: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
});

export type RegisterTenantInput = z.infer<typeof registerTenantSchema>;

export type CreatePurchaseInput = any;
export type CreateSaleInput = any;
export type PaginationInput = any;
