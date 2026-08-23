import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateRequest } from '../middlewares/validateRequest';
import {
  sendOtpSchema,
  verifySignupOtpSchema,
  loginSchema,
  verifyLoginOtpSchema,
  addressSchema,
} from '../validators/authValidator';
import { requireAuth } from '../middlewares/authMiddleware';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// 1. Signup with Email OTP Verification
router.post('/send-signup-otp', authRateLimiter, validateRequest(sendOtpSchema), authController.sendSignupOTP);
router.post('/verify-signup-otp', authRateLimiter, validateRequest(verifySignupOtpSchema), authController.verifySignupOTP);
router.post('/resend-otp', authRateLimiter, validateRequest(sendOtpSchema), authController.resendOTP);

// 2. Standard Password Login & OTP Login
router.post('/login', authRateLimiter, validateRequest(loginSchema), authController.login);
router.post('/send-login-otp', authRateLimiter, validateRequest(sendOtpSchema), authController.sendLoginOTP);
router.post('/verify-login-otp', authRateLimiter, validateRequest(verifyLoginOtpSchema), authController.verifyLoginOTP);

// 3. User Profile & Addresses
router.get('/me', requireAuth, authController.getMe);
router.post('/addresses', requireAuth, validateRequest(addressSchema), authController.addAddress);
router.delete('/addresses/:addressId', requireAuth, authController.deleteAddress);

export default router;
