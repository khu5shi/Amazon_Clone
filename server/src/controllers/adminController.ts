import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { DeliveryZone } from '../models/DeliveryZone';
import { AppError } from '../middlewares/errorHandler';
import { emailService } from '../services/emailService';

export class AdminController {
  /**
   * GET /api/v1/admin/stats
   * Comprehensive metrics for Admin Dashboard
   */
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        totalProducts,
        totalOrders,
        totalCustomers,
        deliveredOrders,
        lowStockProducts,
        orders,
      ] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments({ role: 'customer' }),
        Order.find({ orderStatus: 'Delivered' }),
        Product.find({ stock: { $lt: 10 } }).select('title stock thumbnail price'),
        Order.find().sort({ createdAt: -1 }).limit(10).lean(),
      ]);

      const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalPrice, 0);

      const statusBreakdown = {
        Placed: await Order.countDocuments({ orderStatus: 'Placed' }),
        Shipped: await Order.countDocuments({ orderStatus: 'Shipped' }),
        OutForDelivery: await Order.countDocuments({ orderStatus: 'OutForDelivery' }),
        Delivered: deliveredOrders.length,
        Cancelled: await Order.countDocuments({ orderStatus: 'Cancelled' }),
      };

      return res.status(200).json({
        success: true,
        stats: {
          totalRevenue,
          totalProducts,
          totalOrders,
          totalCustomers,
          statusBreakdown,
          lowStockCount: lowStockProducts.length,
          lowStockItems: lowStockProducts,
          recentOrders: orders,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/products
   */
  async getAdminProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await Product.find().sort({ createdAt: -1 }).lean();
      return res.status(200).json({
        success: true,
        count: products.length,
        products,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/v1/admin/products
   * Create product with dynamic variants and inventory
   */
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const productData = req.body;

      if (!productData.slug) {
        productData.slug = productData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }

      if (productData.originalPrice && productData.price) {
        productData.discountPercentage = Math.round(
          ((productData.originalPrice - productData.price) / productData.originalPrice) * 100
        );
      }

      const product = await Product.create(productData);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        product,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT /api/v1/admin/products/:id
   * Update product stock, pricing, and badges
   */
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.originalPrice && updates.price) {
        updates.discountPercentage = Math.round(
          ((updates.originalPrice - updates.price) / updates.originalPrice) * 100
        );
      }

      const product = await Product.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        product,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/products/:id
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully.',
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/orders
   */
  async getAdminOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const filter: any = {};
      if (status && status !== 'all') {
        filter.orderStatus = status;
      }

      const orders = await Order.find(filter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/orders/:id/status
   * Advance order status (Placed -> Shipped -> OutForDelivery -> Delivered)
   */
  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { orderStatus, location, notes, trackingNumber } = req.body;

      const order = await Order.findById(id).populate('user');
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      order.orderStatus = orderStatus;
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }

      order.statusHistory.push({
        status: orderStatus,
        timestamp: new Date(),
        location: location || 'Amazon Enterprise Fulfillment Center',
        notes: notes || `Order updated to ${orderStatus} by Admin`,
      });

      if (orderStatus === 'Delivered') {
        order.paymentStatus = 'completed';
      }

      await order.save();

      // Dispatch security email notification if customer email exists
      if (order.user && (order.user as any).email) {
        await emailService.sendSecurityAlertEmail(
          (order.user as any).email,
          (order.user as any).name,
          `Order Status Update: #${order.orderNumber}`,
          `Your order status has been updated to "${orderStatus}". Tracking ID: ${order.trackingNumber}`
        );
      }

      return res.status(200).json({
        success: true,
        message: `Order status updated to ${orderStatus}.`,
        order,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/users
   */
  async getAdminUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await User.find({ role: 'customer' })
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET & POST /api/v1/admin/delivery-zones
   */
  async getDeliveryZones(req: Request, res: Response, next: NextFunction) {
    try {
      const zones = await DeliveryZone.find().sort({ postalCode: 1 }).lean();
      return res.status(200).json({
        success: true,
        zones,
      });
    } catch (error) {
      return next(error);
    }
  }

  async createDeliveryZone(req: Request, res: Response, next: NextFunction) {
    try {
      const { postalCode, city, state, expressDeliveryAvailable, standardDeliveryDays, deliveryFee } = req.body;

      const zone = await DeliveryZone.findOneAndUpdate(
        { postalCode },
        { postalCode, city, state, expressDeliveryAvailable, standardDeliveryDays, deliveryFee, isServiceable: true },
        { upsert: true, new: true }
      );

      return res.status(201).json({
        success: true,
        message: 'Delivery zone created / updated successfully.',
        zone,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const adminController = new AdminController();
