import { z } from 'zod';

export const consentUpdateSchema = z.object({
  body: z.object({
    essential: z.boolean().default(true),
    analytics: z.boolean().default(false),
    marketing: z.boolean().default(false),
  }),
});
