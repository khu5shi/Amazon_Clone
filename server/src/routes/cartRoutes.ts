import { Router } from 'express';
import { cartController } from '../controllers/cartController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:itemId', cartController.updateItem);
router.delete('/items/:itemId', cartController.removeItem);
router.post('/save-for-later/:itemId', cartController.saveForLater);
router.post('/move-to-cart/:itemId', cartController.moveToCart);

export default router;
