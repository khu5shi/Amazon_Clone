import { Router } from 'express';
import { privacyController } from '../controllers/privacyController';
import { requireAuth, optionalAuth } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { consentUpdateSchema } from '../validators/privacyValidator';

const router = Router();

// Public / Hybrid
router.get('/policy', privacyController.getPolicy);
router.get('/consent-status', optionalAuth, privacyController.getConsentStatus);
router.post('/update-consent', optionalAuth, validateRequest(consentUpdateSchema), privacyController.updateConsent);

// Protected DPDP User Rights
router.get('/export-data', requireAuth, privacyController.exportData);
router.post('/request-erasure', requireAuth, privacyController.requestErasure);

export default router;
