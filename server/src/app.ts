import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import {
  helmetMiddleware,
  corsMiddleware,
  noSqlSanitizeMiddleware,
  hppMiddleware,
  antiCsrfMiddleware,
} from './middlewares/security';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { sanitizeInputMiddleware } from './middlewares/sanitizeInput';
import { errorHandler } from './middlewares/errorHandler';
import apiRouter from './routes';

const app: Application = express();

// Trust proxy for rate limiters behind load balancers/proxies
app.set('trust proxy', 1);

// 1. Security Headers (CSP, HSTS, X-Frame-Options)
app.use(helmetMiddleware);

// 2. CORS origin control
app.use(corsMiddleware);

// 3. Request Logging (with Morgan)
app.use(morgan('dev'));

// 4. Request Body Parsers (with size limits to prevent payload attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Anti-CSRF Header Check
app.use(antiCsrfMiddleware);

// 6. NoSQL Injection Sanitizer
app.use(noSqlSanitizeMiddleware);

// 7. HTTP Parameter Pollution Protection
app.use(hppMiddleware);

// 8. XSS Input Sanitization
app.use(sanitizeInputMiddleware);

// 9. Global Rate Limiter
app.use('/api', globalRateLimiter);

// 10. Mount REST API v1
app.use('/api/v1', apiRouter);

// 11. Root Welcome / Status
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to the Amazon Enterprise Platform API',
    documentation: '/docs/ARCHITECTURE.md',
    healthCheck: '/api/v1/health',
    dpdpCompliant: true,
  });
});

// 12. 404 Route Handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl} - Route not found.`,
  });
});

// 13. Global Error Handler
app.use(errorHandler);

export default app;
