import { Router } from 'express';
import { productController } from '../controllers/productController';
import { validateRequest } from '../middlewares/validateRequest';
import { productQuerySchema, reviewSchema } from '../validators/productValidator';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', validateRequest(productQuerySchema), productController.getProducts);
router.get('/deals', productController.getDeals);
router.get('/categories', productController.getCategories);
router.get('/:idOrSlug', productController.getProductBySlug);

// Reviews
router.get('/:id/reviews', productController.getReviews);
router.post('/:id/reviews', requireAuth, validateRequest(reviewSchema), productController.createReview);

export default router;
