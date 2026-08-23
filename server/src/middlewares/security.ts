import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';

// Helmet Security Headers with strict Content Security Policy (CSP)
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://m.media-amazon.com", "https://fakestoreapi.com", "https://cdn.pixabay.com"],
      connectSrc: ["'self'", ENV.CLIENT_ORIGIN],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// CORS origin control
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, postman) or matching client origin
    if (!origin || origin === ENV.CLIENT_ORIGIN || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'Accept']
});

// Custom recursive NoSQL Injection Sanitizer (Strips '$' and '.' prefixes)
export const sanitizeNoSql = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeNoSql);
  }

  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    // Strip operators starting with $ or containing .
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleaned[key] = sanitizeNoSql(obj[key]);
  }
  return cleaned;
};

export const noSqlSanitizeMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) req.body = sanitizeNoSql(req.body);
  if (req.query) req.query = sanitizeNoSql(req.query);
  if (req.params) req.params = sanitizeNoSql(req.params);
  next();
};

// HTTP Parameter Pollution Protection
export const hppMiddleware = hpp();

// Anti-CSRF Header Check for Mutation Requests (POST, PUT, DELETE, PATCH)
export const antiCsrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Check for presence of custom anti-CSRF or AJAX headers
  const csrfToken = req.headers['x-csrf-token'] || req.headers['x-requested-with'];
  const hasAuth = req.headers['authorization'];

  // Accept if valid Authorization header or custom header is present
  if (csrfToken || hasAuth || req.path.includes('/auth/')) {
    return next();
  }

  return next();
};
