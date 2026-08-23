import { z } from 'zod';

export const productQuerySchema = z.object({
  query: z.object({
    keyword: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    minPrice: z.string().regex(/^\d+$/).transform(Number).optional(),
    maxPrice: z.string().regex(/^\d+$/).transform(Number).optional(),
    minRating: z.string().regex(/^[1-5]$/).transform(Number).optional(),
    isPrime: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    isLightningDeal: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    sort: z.enum(['featured', 'price_asc', 'price_desc', 'rating', 'newest']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('16'),
  }),
});

export const reviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    title: z.string().min(2, 'Review title must be at least 2 characters').max(100),
    comment: z.string().min(5, 'Review comment must be at least 5 characters').max(2000),
    variantInfo: z.string().optional(),
  }),
});
