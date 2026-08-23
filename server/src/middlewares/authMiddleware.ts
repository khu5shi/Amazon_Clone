import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// Enforce valid JWT token
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required. Please sign in.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error: any) {
    logger.warn(`JWT verification failed: ${error.message}`);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token. Please sign in again.'
    });
  }
};

// Optional auth: Hydrates req.user if token is present, but doesn't block if absent
export const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      req.user = decoded;
    }
  } catch (err) {
    // Ignore invalid token on optional auth routes
  }
  return next();
};

// Require Admin Role
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Administrator privileges required.'
    });
  }
  return next();
};
