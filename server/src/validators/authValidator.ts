import { z } from 'zod';

export const sendOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    type: z.enum(['signup', 'login', 'reset_password']).default('signup'),
    name: z.string().optional(),
  }),
});

export const verifySignupOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    otp: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().regex(/^\+?[0-9]{10,13}$/, 'Please enter a valid 10-digit phone number').optional(),
    consent: z.object({
      essential: z.boolean().refine((val) => val === true, 'Essential consent is required'),
      analytics: z.boolean().optional(),
      marketing: z.boolean().optional(),
    }).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const verifyLoginOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    otp: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
  }),
});

export const addressSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().regex(/^\+?[0-9]{10,13}$/, 'Please enter a valid 10-digit phone number'),
    street: z.string().min(5, 'Street address is required'),
    apartment: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().regex(/^[0-9]{6}$/, 'Please enter a valid 6-digit PIN code'),
    country: z.string().default('India'),
    isDefault: z.boolean().optional(),
    type: z.enum(['home', 'work', 'other']).default('home'),
  }),
});
