import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/amazon_enterprise',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_for_amazon_enterprise_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '150', 10),
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
  
  // Root Admin Credentials
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@amazon.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',

  // Gmail / SMTP Configuration
  SMTP_SERVICE: process.env.SMTP_SERVICE || 'gmail',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '465', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true' || true,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Amazon Enterprise <no-reply@amazon-enterprise.dev>',
  
  // OTP Expiration (60 Seconds)
  OTP_EXPIRES_SECONDS: parseInt(process.env.OTP_EXPIRES_SECONDS || '60', 10),

  // DPDP Governance
  DPDP_GRIEVANCE_OFFICER_NAME: process.env.DPDP_GRIEVANCE_OFFICER_NAME || 'Rahul Sharma',
  DPDP_GRIEVANCE_OFFICER_EMAIL: process.env.DPDP_GRIEVANCE_OFFICER_EMAIL || 'grievance-officer@amazon-enterprise.dev',
};
