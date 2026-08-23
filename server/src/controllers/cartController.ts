import { Response, NextFunction } from 'express';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { AppError } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

const recalculateCart = (cart: any) => {
  let subtotal = 0;
  for (const item of cart.items) {
    if (item.selected) {
      subtotal += item.price * item.quantity;
    }
  }

  // Free delivery for orders above ₹499
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
  const estimatedTax = Math.round(subtotal * 0.18);
  const total = subtotal + deliveryFee + estimatedTax;

  cart.subtotal = subtotal;
  cart.deliveryFee = deliveryFee;
  cart.estimatedTax = estimatedTax;
  cart.total = total;
};

export class CartController {
  // GET /api/v1/cart
  async getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      let cart = await Cart.findOne({ user: userId }).populate('items.product').populate('savedForLater.product');

      if (!cart) {
        cart = await Cart.create({ user: userId, items: [], savedForLater: [] });
      }

      recalculateCart(cart);
      await cart.save();

      return res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      return next(error);
    }
  }

  // POST /api/v1/cart/items
  async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { productId, variantId, variantName, quantity = 1 } = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      let price = product.price;
      if (variantId && product.variants) {
        const variant = product.variants.find((v: any) => v._id.toString() === variantId || v.sku === variantId);
        if (variant) {
          price += variant.priceDelta;
        }
      }

      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      const existingIndex = cart.items.findIndex(
        (item: any) =>
          item.product.toString() === productId &&
          (variantId ? item.variantId === variantId : !item.variantId)
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += quantity;
      } else {
        cart.items.push({
          product: productId,
          variantId,
          variantName,
          quantity,
          price,
          selected: true,
        });
      }

      recalculateCart(cart);
      await cart.save();
      await cart.populate('items.product');

      return res.status(200).json({
        success: true,
        message: 'Item added to cart.',
        data: cart,
      });
    } catch (error) {
      return next(error);
    }
  }

  // PUT /api/v1/cart/items/:itemId
  async updateItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { itemId } = req.params;
      const { quantity, selected } = req.body;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new AppError('Cart not found', 404);
      }

      const item = cart.items.find((i: any) => i._id.toString() === itemId);
      if (!item) {
        throw new AppError('Item not found in cart', 404);
      }

      if (quantity !== undefined) {
        if (quantity <= 0) {
          cart.items = cart.items.filter((i: any) => i._id.toString() !== itemId);
        } else {
          item.quantity = quantity;
        }
      }

      if (selected !== undefined) {
        item.selected = selected;
      }

      recalculateCart(cart);
      await cart.save();
      await cart.populate('items.product');

      return res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      return next(error);
    }
  }

  // DELETE /api/v1/cart/items/:itemId
  async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { itemId } = req.params;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new AppError('Cart not found', 404);
      }

      cart.items = cart.items.filter((i: any) => i._id.toString() !== itemId);

      recalculateCart(cart);
      await cart.save();
      await cart.populate('items.product');

      return res.status(200).json({
        success: true,
        message: 'Item removed from cart.',
        data: cart,
      });
    } catch (error) {
      return next(error);
    }
  }

  // POST /api/v1/cart/save-for-later/:itemId
  async saveForLater(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { itemId } = req.params;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new AppError('Cart not found', 404);
      }

      const itemIndex = cart.items.findIndex((i: any) => i._id.toString() === itemId);
      if (itemIndex === -1) {
        throw new AppError('Item not found in cart', 404);
      }

      const [item] = cart.items.splice(itemIndex, 1);
      cart.savedForLater.push(item);

      recalculateCart(cart);
      await cart.save();
      await cart.populate('items.product');
      await cart.populate('savedForLater.product');

      return res.status(200).json({
        success: true,
        message: 'Item moved to Saved for Later.',
        data: cart,
      });
    } catch (error) {
      return next(error);
    }
  }

  // POST /api/v1/cart/move-to-cart/:itemId
  async moveToCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { itemId } = req.params;

      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new AppError('Cart not found', 404);
      }

      const itemIndex = cart.savedForLater.findIndex((i: any) => i._id.toString() === itemId);
      if (itemIndex === -1) {
        throw new AppError('Item not found in Saved for Later', 404);
      }

      const [item] = cart.savedForLater.splice(itemIndex, 1);
      cart.items.push(item);

      recalculateCart(cart);
      await cart.save();
      await cart.populate('items.product');
      await cart.populate('savedForLater.product');

      return res.status(200).json({
        success: true,
        message: 'Item moved back to Cart.',
        data: cart,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const cartController = new CartController();
