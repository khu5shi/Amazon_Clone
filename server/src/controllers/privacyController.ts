import { Request, Response, NextFunction } from 'express';
import { privacyService } from '../services/privacyService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { User } from '../models/User';

export class PrivacyController {
  // GET /api/v1/privacy/consent-status
  async getConsentStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.userId) {
        const user = await User.findById(req.user.userId);
        return res.status(200).json({
          success: true,
          consent: user?.consentSettings || { essential: true, analytics: false, marketing: false },
        });
      }

      return res.status(200).json({
        success: true,
        consent: { essential: true, analytics: false, marketing: false },
      });
    } catch (error) {
      return next(error);
    }
  }

  // POST /api/v1/privacy/update-consent
  async updateConsent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'];
      const preferences = req.body;

      const result = await privacyService.recordConsent({
        userId,
        ipAddress,
        userAgent,
        preferences,
        action: 'updated',
      });

      return res.status(200).json({
        success: true,
        message: 'Consent preferences updated and logged successfully.',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  // GET /api/v1/privacy/export-data (DPDP Right to Access)
  async exportData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const exportPackage = await privacyService.exportUserData(userId);

      // Return formatted JSON download payload
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="DPDP_User_Data_Export_${userId}_${Date.now()}.json"`
      );

      return res.status(200).json(exportPackage);
    } catch (error) {
      return next(error);
    }
  }

  // POST /api/v1/privacy/request-erasure (DPDP Right to Erasure / Forget Me)
  async requestErasure(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const result = await privacyService.anonymizeAccount(userId);

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  // GET /api/v1/privacy/policy
  async getPolicy(_req: Request, res: Response) {
    const policy = privacyService.getPrivacyPolicyInfo();
    return res.status(200).json({
      success: true,
      data: policy,
    });
  }
}

export const privacyController = new PrivacyController();
