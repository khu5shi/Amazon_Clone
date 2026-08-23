import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env';

// Global API rate limiter (150 requests per 15 minutes)
export const globalRateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: ENV.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

// Strict Auth rate limiter (10 attempts per 15 minutes to block brute-force password spraying)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: ENV.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});
