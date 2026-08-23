import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Protect all admin routes with JWT Auth & Admin Role Check
router.use(requireAuth, requireAdmin);

// Dashboard Overview
router.get('/stats', adminController.getDashboardStats);

// Product & Inventory Management
router.get('/products', adminController.getAdminProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Order Fulfillment Console
router.get('/orders', adminController.getAdminOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// Customer Account Management
router.get('/users', adminController.getAdminUsers);

// Delivery Zones
router.get('/delivery-zones', adminController.getDeliveryZones);
router.post('/delivery-zones', adminController.createDeliveryZone);

export default router;
