import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { requireAuth } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createOrderSchema } from '../validators/orderValidator';

const router = Router();

router.use(requireAuth);

router.post('/', validateRequest(createOrderSchema), orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/cancel', orderController.cancelOrder);

export default router;
