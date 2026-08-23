import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
import orderRoutes from './orderRoutes';
import privacyRoutes from './privacyRoutes';
import adminRoutes from './adminRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/privacy', privacyRoutes);
apiRouter.use('/admin', adminRoutes);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Amazon Enterprise REST API',
    dpdpCompliant: true,
    version: '1.0.0',
  });
});

export default apiRouter;
