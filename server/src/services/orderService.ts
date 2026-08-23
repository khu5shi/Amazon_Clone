import { Order, IOrder } from '../models/Order';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { emailService } from './emailService';
import { AppError } from '../middlewares/errorHandler';

export interface CreateOrderDTO {
  userId: string;
  shippingAddress: any;
  paymentMethod: 'amazon_pay' | 'card' | 'upi' | 'cod';
  deliveryMethod: 'prime_express' | 'standard';
  paymentDetails?: any;
}

export class OrderService {
  async createOrder(data: CreateOrderDTO) {
    const { userId, shippingAddress, paymentMethod, deliveryMethod, paymentDetails } = data;

    // Fetch user cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty. Please add items before placing an order.', 400);
    }

    // Filter selected items
    const selectedItems = cart.items.filter((item: any) => item.selected);
    if (selectedItems.length === 0) {
      throw new AppError('No items selected for checkout.', 400);
    }

    // Build order items and calculate totals
    let itemsPrice = 0;
    const orderItems: any[] = [];

    for (const item of selectedItems) {
      const product = item.product;
      if (!product) {
        throw new AppError('One of the products in your cart is no longer available.', 400);
      }

      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for "${product.title}". Only ${product.stock} left.`, 400);
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();

      const itemTotal = item.price * item.quantity;
      itemsPrice += itemTotal;

      orderItems.push({
        product: product._id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: item.price,
        quantity: item.quantity,
        variantName: item.variantName,
      });
    }

    // Pricing calculation
    const shippingPrice = deliveryMethod === 'prime_express' ? 0 : 40;
    const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST standard
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Generate unique human-readable Amazon order number & tracking ID
    const randomSuffix = Math.floor(1000000 + Math.random() * 9000000);
    const orderNumber = `402-${randomSuffix}-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const trackingNumber = `AMZN-IN-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;

    // Calculate delivery date (Tomorrow for Prime, 3 days for standard)
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(
      estimatedDeliveryDate.getDate() + (deliveryMethod === 'prime_express' ? 1 : 3)
    );

    const initialHistory = [
      {
        status: 'Placed',
        timestamp: new Date(),
        location: `${shippingAddress.city} Fulfillment Hub`,
        notes: 'Order received and confirmed by Amazon.',
      },
    ];

    const order = await Order.create({
      orderNumber,
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      paymentDetails: {
        ...paymentDetails,
        paidAt: paymentMethod === 'cod' ? undefined : new Date(),
        transactionId: `TXN_AMZN_${Date.now()}`,
      },
      deliveryMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      orderStatus: 'Placed',
      statusHistory: initialHistory,
      trackingNumber,
      estimatedDeliveryDate,
    });

    // Remove purchased items from cart
    cart.items = cart.items.filter((item: any) => !item.selected);
    await cart.save();

    // Send Amazon Order Confirmation & Tax Invoice Email
    try {
      const customer = await User.findById(userId);
      if (customer && customer.email) {
        await emailService.sendOrderConfirmationEmail(customer.email, customer.name, order);
      }
    } catch (e) {
      // Non-blocking email error
    }

    return order;
  }

  async getUserOrders(userId: string) {
    return Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await Order.findOne({
      $or: [{ _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }, { orderNumber: orderId }],
      user: userId,
    }).lean();

    if (!order) {
      throw new AppError('Order not found or unauthorized', 404);
    }
    return order;
  }

  async cancelOrder(orderId: string, userId: string, reason: string) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      throw new AppError('Order not found or unauthorized', 404);
    }

    if (['Shipped', 'OutForDelivery', 'Delivered'].includes(order.orderStatus)) {
      throw new AppError('Order cannot be cancelled because it has already been dispatched.', 400);
    }

    order.orderStatus = 'Cancelled';
    order.isCancelled = true;
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Customer requested cancellation';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      notes: reason || 'Order was cancelled by the customer.',
    });

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();
    return order;
  }
}

export const orderService = new OrderService();
