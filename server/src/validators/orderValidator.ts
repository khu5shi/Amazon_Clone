import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      fullName: z.string().min(2, 'Full name is required'),
      phone: z.string().regex(/^\+?[0-9]{10,13}$/, 'Please enter a valid 10-digit phone number'),
      street: z.string().min(5, 'Street address is required'),
      apartment: z.string().optional(),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      postalCode: z.string().regex(/^[0-9]{6}$/, 'Please enter a valid 6-digit PIN code'),
      country: z.string().default('India'),
    }),
    paymentMethod: z.enum(['amazon_pay', 'card', 'upi', 'cod']),
    deliveryMethod: z.enum(['prime_express', 'standard']).default('prime_express'),
    paymentDetails: z.object({
      cardLast4: z.string().optional(),
      upiId: z.string().optional(),
    }).optional(),
  }),
});
