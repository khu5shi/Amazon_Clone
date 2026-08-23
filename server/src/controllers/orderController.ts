import { Response, NextFunction } from 'express';
import { orderService } from '../services/orderService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class OrderController {
  // POST /api/v1/orders
  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const { shippingAddress, paymentMethod, deliveryMethod, paymentDetails } = req.body;

      const order = await orderService.createOrder({
        userId,
        shippingAddress,
        paymentMethod,
        deliveryMethod,
        paymentDetails,
      });

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        order,
      });
    } catch (error) {
      return next(error);
    }
  }

  // GET /api/v1/orders/my-orders
  async getMyOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const orders = await orderService.getUserOrders(userId);

      return res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      return next(error);
    }
  }

  // GET /api/v1/orders/:id
  async getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const { id } = req.params;
      const order = await orderService.getOrderById(id, userId);

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      return next(error);
    }
  }

  // PATCH /api/v1/orders/:id/cancel
  async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId!;
      const { id } = req.params;
      const { reason } = req.body;

      const order = await orderService.cancelOrder(id, userId, reason);

      return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully.',
        data: order,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const orderController = new OrderController();
