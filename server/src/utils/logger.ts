import winston from 'winston';
import { ENV } from '../config/env';

// Masking helper for PII in logs
export const maskPII = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  const masked = Array.isArray(data) ? [...data] : { ...data };

  for (const key of Object.keys(masked)) {
    if (typeof masked[key] === 'string') {
      // Mask email
      if (key.toLowerCase().includes('email') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(masked[key])) {
        const parts = masked[key].split('@');
        masked[key] = parts[0].slice(0, 2) + '***@' + (parts[1] || '');
      }
      // Mask phone
      else if (key.toLowerCase().includes('phone')) {
        masked[key] = masked[key].replace(/(\d{2})\d+(\d{3})/, '$1*****$2');
      }
      // Mask password
      else if (key.toLowerCase().includes('password')) {
        masked[key] = '[REDACTED]';
      }
      // Mask card
      else if (key.toLowerCase().includes('card') || key.toLowerCase().includes('cvv')) {
        masked[key] = '**** **** **** ' + masked[key].slice(-4);
      }
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskPII(masked[key]);
    }
  }

  return masked;
};

export const logger = winston.createLogger({
  level: ENV.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
      const maskedMeta = Object.keys(meta).length ? JSON.stringify(maskPII(meta)) : '';
      return `[${timestamp}] [${level.toUpperCase()}]: ${stack || message} ${maskedMeta}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
          const maskedMeta = Object.keys(meta).length ? JSON.stringify(maskPII(meta)) : '';
          return `[${timestamp}] ${level}: ${stack || message} ${maskedMeta}`;
        })
      )
    })
  ]
});
