import crypto from 'crypto';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { Cart } from '../models/Cart';
import { ConsentLog } from '../models/ConsentLog';
import { AppError } from '../middlewares/errorHandler';
import { ENV } from '../config/env';

export class PrivacyService {
  /**
   * DPDP: Record or update user consent with immutable audit log
   */
  async recordConsent(data: {
    userId?: string;
    ipAddress: string;
    userAgent?: string;
    preferences: { essential: boolean; analytics: boolean; marketing: boolean };
    action?: 'granted' | 'revoked' | 'updated';
  }) {
    const { userId, ipAddress, userAgent, preferences, action = 'updated' } = data;

    // Create immutable audit log
    await ConsentLog.create({
      user: userId,
      ipAddress,
      userAgent,
      consentType: 'all',
      action,
      preferences,
      noticeVersion: 'DPDP-2023-V1.0',
      timestamp: new Date(),
    });

    // If user is authenticated, update their active consent flags
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        consentSettings: {
          ...preferences,
          updatedAt: new Date(),
        },
      });
    }

    return { success: true, preferences, noticeVersion: 'DPDP-2023-V1.0' };
  }

  /**
   * DPDP: Right to Access / Data Portability (Export all personal data as JSON)
   */
  async exportUserData(userId: string) {
    const user = await User.findById(userId).select('+password').lean();
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const [orders, reviews, consentHistory] = await Promise.all([
      Order.find({ user: userId }).lean(),
      Review.find({ user: userId }).lean(),
      ConsentLog.find({ user: userId }).sort({ timestamp: -1 }).lean(),
    ]);

    // Redact password hash
    delete (user as any).password;

    return {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        act: 'Digital Personal Data Protection (DPDP) Act 2023 - Section 11',
        dataFiduciary: 'Amazon Enterprise Platform Inc.',
        userId: user._id,
      },
      personalProfile: user,
      savedAddresses: user.addresses,
      orderHistory: orders,
      productReviews: reviews,
      consentAuditLedger: consentHistory,
    };
  }

  /**
   * DPDP: Right to Erasure / Account Anonymization ("Forget Me")
   */
  async anonymizeAccount(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isAnonymized) {
      throw new AppError('This account has already been anonymized.', 400);
    }

    // Generate random cryptographic pseudonym
    const randomHash = crypto.randomBytes(8).toString('hex');
    const anonymizedEmail = `anonymized_${randomHash}@dpdp-purged.local`;
    const anonymizedName = `Anonymized User (${randomHash})`;

    // Anonymize user record
    user.name = anonymizedName;
    user.email = anonymizedEmail;
    user.phone = undefined;
    user.addresses = [];
    user.isAnonymized = true;
    user.anonymizedAt = new Date();
    user.consentSettings = {
      essential: true,
      analytics: false,
      marketing: false,
      updatedAt: new Date(),
    };
    await user.save();

    // Clear active cart
    await Cart.findOneAndDelete({ user: userId });

    // Anonymize shipping addresses on historical orders for privacy while preserving statutory financial records
    await Order.updateMany(
      { user: userId },
      {
        $set: {
          'shippingAddress.fullName': anonymizedName,
          'shippingAddress.phone': '0000000000',
          'shippingAddress.street': '[REDACTED AS PER DPDP ERASURE REQUEST]',
          'shippingAddress.apartment': '',
        },
      }
    );

    // Record erasure event in ConsentLog
    await ConsentLog.create({
      user: userId,
      ipAddress: '0.0.0.0',
      consentType: 'all',
      action: 'revoked',
      preferences: { essential: true, analytics: false, marketing: false },
      noticeVersion: 'DPDP-2023-V1.0',
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Account and personal data have been successfully anonymized in compliance with DPDP Act 2023.',
      anonymizedId: randomHash,
    };
  }

  /**
   * DPDP Notice and Grievance Officer details
   */
  getPrivacyPolicyInfo() {
    return {
      noticeTitle: 'Amazon Enterprise DPDP Act 2023 Data Protection Notice',
      noticeVersion: 'DPDP-2023-V1.0',
      effectiveDate: '2026-01-01',
      dataFiduciary: 'Amazon Enterprise Platform Private Limited',
      purposes: [
        'Account registration and authentication',
        'Order placement, billing, and fulfillment',
        'Customer support and returns processing',
        'Regulatory tax compliance and fraud prevention',
      ],
      userRights: [
        'Right to Access information about personal data (Section 11)',
        'Right to Correction and Erasure of personal data (Section 12)',
        'Right to Grievance Redressal (Section 13)',
        'Right to Nominate (Section 14)',
      ],
      grievanceOfficer: {
        name: ENV.DPDP_GRIEVANCE_OFFICER_NAME,
        email: ENV.DPDP_GRIEVANCE_OFFICER_EMAIL,
        address: 'Amazon Enterprise Tower, Cyber Hub, Gurugram, Haryana - 122002, India',
        responseTimeLimit: 'Within 7 business days',
      },
    };
  }
}

export const privacyService = new PrivacyService();
