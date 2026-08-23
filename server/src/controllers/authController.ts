import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { Cart } from '../models/Cart';
import { OTP } from '../models/OTP';
import { signToken } from '../utils/jwt';
import { AppError } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { privacyService } from '../services/privacyService';
import { emailService } from '../services/emailService';
import { ENV } from '../config/env';

export class AuthController {
  /**
   * POST /api/v1/auth/send-signup-otp
   * Generates a 6-digit OTP with 60-second expiration and sends it via SMTP
   */
  async sendSignupOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name } = req.body;

      // Check if user already exists and is verified
      const existingUser = await User.findOne({ email, isEmailVerified: true });
      if (existingUser) {
        throw new AppError('An account with this email address already exists. Please sign in.', 409);
      }

      // Generate 6-digit numeric OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + ENV.OTP_EXPIRES_SECONDS * 1000); // exactly 60 seconds

      // Delete any previous OTPs for this email
      await OTP.deleteMany({ email, type: 'signup' });

      // Save new OTP with 60-second TTL
      await OTP.create({
        email,
        otp: otpCode,
        type: 'signup',
        expiresAt,
        attempts: 0,
      });

      // Dispatch HTML Email via Gmail / SMTP
      const mailResult = await emailService.sendOTPEmail(
        email,
        name || email.split('@')[0],
        otpCode,
        'signup'
      );

      return res.status(200).json({
        success: true,
        message: `Verification code sent to ${email}. Code expires in ${ENV.OTP_EXPIRES_SECONDS} seconds.`,
        expiresIn: ENV.OTP_EXPIRES_SECONDS,
        previewUrl: mailResult.previewUrl,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/v1/auth/verify-signup-otp
   * Validates the 60s OTP and registers the user as verified
   */
  async verifySignupOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, name, password, phone, consent } = req.body;

      // Find active OTP record
      const otpRecord = await OTP.findOne({ email, type: 'signup' });
      if (!otpRecord) {
        throw new AppError('OTP expired or not found. Please click Resend OTP to get a fresh code.', 400);
      }

      // Check 60-second expiration
      if (new Date() > otpRecord.expiresAt) {
        await OTP.deleteOne({ _id: otpRecord._id });
        throw new AppError('OTP has expired (60-second limit). Please click Resend OTP to receive a new code.', 400);
      }

      // Validate OTP match
      if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        if (otpRecord.attempts >= 3) {
          await OTP.deleteOne({ _id: otpRecord._id });
          throw new AppError('Too many invalid attempts. Please request a new OTP.', 400);
        }
        await otpRecord.save();
        throw new AppError(`Invalid verification code. ${3 - otpRecord.attempts} attempt(s) remaining.`, 400);
      }

      // Delete verified OTP record
      await OTP.deleteOne({ _id: otpRecord._id });

      // Create or update user as verified
      let user = await User.findOne({ email });
      if (user) {
        user.name = name;
        user.password = password;
        user.phone = phone;
        user.isEmailVerified = true;
        user.emailVerifiedAt = new Date();
        await user.save();
      } else {
        user = await User.create({
          name,
          email,
          password,
          phone,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          consentSettings: {
            essential: true,
            analytics: consent?.analytics || false,
            marketing: consent?.marketing || false,
            updatedAt: new Date(),
          },
        });
      }

      // Record DPDP Consent
      const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
      await privacyService.recordConsent({
        userId: user._id.toString(),
        ipAddress,
        userAgent: req.headers['user-agent'],
        preferences: {
          essential: true,
          analytics: consent?.analytics || false,
          marketing: consent?.marketing || false,
        },
        action: 'granted',
      });

      // Initialize user cart
      await Cart.findOneAndUpdate(
        { user: user._id },
        { user: user._id, items: [] },
        { upsert: true }
      );

      // Send Security Welcome Alert
      await emailService.sendSecurityAlertEmail(
        email,
        name,
        'Account Created & Verified',
        'Your Amazon Enterprise account was successfully verified and activated.'
      );

      const token = signToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return res.status(201).json({
        success: true,
        message: 'Account verified and registered successfully.',
        token,
        user: user.getMaskedData(),
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/v1/auth/resend-otp
   */
  async resendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, type = 'signup', name } = req.body;

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + ENV.OTP_EXPIRES_SECONDS * 1000);

      await OTP.deleteMany({ email, type });
      await OTP.create({
        email,
        otp: otpCode,
        type,
        expiresAt,
        attempts: 0,
      });

      const mailResult = await emailService.sendOTPEmail(
        email,
        name || email.split('@')[0],
        otpCode,
        type as any
      );

      return res.status(200).json({
        success: true,
        message: `Fresh verification code sent to ${email}. Valid for ${ENV.OTP_EXPIRES_SECONDS} seconds.`,
        expiresIn: ENV.OTP_EXPIRES_SECONDS,
        previewUrl: mailResult.previewUrl,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Validates credentials and verifies that user's email is confirmed
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const lowerEmail = email.toLowerCase().trim();

      // Check if logging in with Root Admin credentials from .env
      if (lowerEmail === ENV.ADMIN_EMAIL.toLowerCase().trim() && password === ENV.ADMIN_PASSWORD) {
        let adminUser = await User.findOne({ email: lowerEmail });
        if (!adminUser) {
          adminUser = await User.create({
            name: 'Amazon Root Administrator',
            email: lowerEmail,
            password: ENV.ADMIN_PASSWORD,
            role: 'admin',
            phone: '+919800000001',
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
            addresses: [],
            consentSettings: { essential: true, analytics: true, marketing: true, updatedAt: new Date() },
          });
        }

        const token = signToken({
          userId: adminUser._id.toString(),
          email: adminUser.email,
          role: 'admin',
        });

        return res.status(200).json({
          success: true,
          message: 'Signed in as Administrator.',
          token,
          user: adminUser.getMaskedData(),
        });
      }

      const user = await User.findOne({ email: lowerEmail }).select('+password');
      if (!user) {
        throw new AppError('Invalid email or password.', 401);
      }

      if (user.isAnonymized) {
        throw new AppError('This account was previously deleted in compliance with DPDP.', 403);
      }

      // Check if user has verified their email address
      if (!user.isEmailVerified) {
        throw new AppError(
          'Your email address is not verified. Please verify your email address to sign in.',
          403
        );
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new AppError('Invalid email or password.', 401);
      }

      const token = signToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return res.status(200).json({
        success: true,
        message: 'Signed in successfully.',
        token,
        user: user.getMaskedData(),
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/v1/auth/send-login-otp
   * Allows passwordless login via 60s Email OTP
   */
  async sendLoginOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        throw new AppError('No account found with this email address. Please register first.', 404);
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + ENV.OTP_EXPIRES_SECONDS * 1000);

      await OTP.deleteMany({ email, type: 'login' });
      await OTP.create({
        email,
        otp: otpCode,
        type: 'login',
        expiresAt,
        attempts: 0,
      });

      const mailResult = await emailService.sendOTPEmail(email, user.name, otpCode, 'login');

      return res.status(200).json({
        success: true,
        message: `Sign-in OTP sent to ${email} (expires in ${ENV.OTP_EXPIRES_SECONDS}s).`,
        expiresIn: ENV.OTP_EXPIRES_SECONDS,
        previewUrl: mailResult.previewUrl,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/v1/auth/verify-login-otp
   */
  async verifyLoginOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;

      const otpRecord = await OTP.findOne({ email, type: 'login' });
      if (!otpRecord) {
        throw new AppError('OTP expired or not found. Please click Resend OTP.', 400);
      }

      if (new Date() > otpRecord.expiresAt) {
        await OTP.deleteOne({ _id: otpRecord._id });
        throw new AppError('OTP has expired (60-second limit). Please request a fresh OTP.', 400);
      }

      if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        if (otpRecord.attempts >= 3) {
          await OTP.deleteOne({ _id: otpRecord._id });
          throw new AppError('Too many invalid attempts. Please request a new OTP.', 400);
        }
        await otpRecord.save();
        throw new AppError(`Invalid code. ${3 - otpRecord.attempts} attempt(s) remaining.`, 400);
      }

      await OTP.deleteOne({ _id: otpRecord._id });

      const user = await User.findOne({ email });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        user.emailVerifiedAt = new Date();
        await user.save();
      }

      const token = signToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return res.status(200).json({
        success: true,
        message: 'Signed in with OTP successfully.',
        token,
        user: user.getMaskedData(),
      });
    } catch (error) {
      return next(error);
    }
  }

  // GET /api/v1/auth/me
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user?.userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      return res.status(200).json({
        success: true,
        user: user.getMaskedData(),
      });
    } catch (error) {
      return next(error);
    }
  }

  // POST /api/v1/auth/addresses
  async addAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user?.userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const addressData = req.body;
      if (addressData.isDefault || user.addresses.length === 0) {
        user.addresses.forEach((addr) => (addr.isDefault = false));
        addressData.isDefault = true;
      }

      user.addresses.push(addressData);
      await user.save();

      // Dispatch security email alert
      await emailService.sendSecurityAlertEmail(
        user.email,
        user.name,
        'New Delivery Address Added',
        `${addressData.street}, ${addressData.city} - ${addressData.postalCode}`
      );

      return res.status(201).json({
        success: true,
        message: 'Address added successfully.',
        addresses: user.addresses,
      });
    } catch (error) {
      return next(error);
    }
  }

  // DELETE /api/v1/auth/addresses/:addressId
  async deleteAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { addressId } = req.params;
      const user = await User.findById(req.user?.userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.addresses = user.addresses.filter((addr: any) => addr._id.toString() !== addressId);
      if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
        user.addresses[0].isDefault = true;
      }

      await user.save();

      // Dispatch security email alert
      await emailService.sendSecurityAlertEmail(
        user.email,
        user.name,
        'Delivery Address Removed',
        'A delivery address was removed from your address book.'
      );

      return res.status(200).json({
        success: true,
        message: 'Address removed successfully.',
        addresses: user.addresses,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const authController = new AuthController();
