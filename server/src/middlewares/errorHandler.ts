import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ENV } from '../config/env';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account or record with this ${field} already exists.`;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with invalid identifier: ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please sign in again.';
  }

  // Log error with PII protection
  if (statusCode >= 500) {
    logger.error(`[Unhandled Server Error] ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`[Client Error ${statusCode}] ${message}`);
  }

  // Return sanitized response (Do not leak internal stack traces in production)
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(ENV.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
