import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/productService';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { AppError } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class ProductController {
  // GET /api/v1/products
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.getProducts(req.query as any);
      return res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination,
        facets: result.facets,
      });
    } catch (error) {
      return next(error);
    }
  }

  // GET /api/v1/products/deals
  async getDeals(_req: Request, res: Response, next: NextFunction) {
    try {
      const deals = await productService.getLightningDeals();
      return res.status(200).json({
        success: true,
        data: deals,
      });
    } catch (error) {
      return next(error);
    }
  }

  // GET /api/v1/products/categories
  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await productService.getCategories();
      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      return next(error);
    }
  }

  // GET /api/v1/products/:idOrSlug
  async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { idOrSlug } = req.params;
      const result = await productService.getProductByIdOrSlug(idOrSlug);

      if (!result) {
        throw new AppError('Product not found', 404);
      }

      return res.status(200).json({
        success: true,
        data: result.product,
        relatedProducts: result.relatedProducts,
        recentReviews: result.recentReviews,
      });
    } catch (error) {
      return next(error);
    }
  }

  // POST /api/v1/products/:id/reviews
  async createReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { rating, title, comment, variantInfo } = req.body;
      const userId = req.user?.userId;

      const product = await Product.findById(id);
      if (!product) {
        throw new AppError('Product not found', 404);
      }

      const existingReview = await Review.findOne({ user: userId, product: id });
      if (existingReview) {
        throw new AppError('You have already submitted a review for this product.', 400);
      }

      const review = await Review.create({
        user: userId,
        userName: req.user?.email.split('@')[0] || 'Amazon Customer',
        product: id,
        rating,
        title,
        comment,
        variantInfo,
        isVerifiedPurchase: true,
      });

      // Recalculate product rating & numReviews
      const allReviews = await Review.find({ product: id });
      const avgRating =
        allReviews.reduce((acc, curr) => acc + curr.rating, 0) / (allReviews.length || 1);

      product.rating = parseFloat(avgRating.toFixed(1));
      product.numReviews = allReviews.length;
      await product.save();

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully.',
        review,
      });
    } catch (error) {
      return next(error);
    }
  }

  // GET /api/v1/products/:id/reviews
  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const reviews = await Review.find({ product: id }).sort({ createdAt: -1 }).lean();

      // Calculate rating breakdown distribution
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach((r) => {
        const star = Math.floor(r.rating) as 1 | 2 | 3 | 4 | 5;
        if (breakdown[star] !== undefined) {
          breakdown[star]++;
        }
      });

      return res.status(200).json({
        success: true,
        data: reviews,
        total: reviews.length,
        breakdown,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const productController = new ProductController();
