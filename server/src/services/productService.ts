import { Product, IProduct } from '../models/Product';
import { Category } from '../models/Category';
import { Review } from '../models/Review';

export interface ProductQueryParams {
  keyword?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  isPrime?: boolean;
  isLightningDeal?: boolean;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}

export class ProductService {
  async getProducts(params: ProductQueryParams) {
    const {
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      isPrime,
      isLightningDeal,
      sort = 'featured',
      page = 1,
      limit = 16,
    } = params;

    const query: any = {};

    // Text search or keyword match
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } },
      ];
    }

    // Category filter by slug
    if (category && category !== 'all') {
      query.categorySlug = category;
    }

    // Brand filter
    if (brand) {
      const brands = brand.split(',').map((b) => b.trim());
      query.brand = { $in: brands.map((b) => new RegExp(`^${b}$`, 'i')) };
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    // Rating filter (e.g. 4 stars & up)
    if (minRating !== undefined) {
      query.rating = { $gte: minRating };
    }

    // Prime eligible
    if (isPrime !== undefined) {
      query.isPrimeEligible = isPrime;
    }

    // Lightning deals
    if (isLightningDeal !== undefined) {
      query.isLightningDeal = isLightningDeal;
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1, numReviews: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };
    else if (sort === 'featured') sortOptions = { isBestSeller: -1, isAmazonChoice: -1, rating: -1 };

    const skip = (page - 1) * limit;

    const [products, totalCount, brandsAggregation, categoryAggregation] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
      Product.distinct('brand', category ? { categorySlug: category } : {}),
      Category.find({}).sort({ order: 1 }).lean(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      facets: {
        availableBrands: brandsAggregation,
        categories: categoryAggregation,
      },
    };
  }

  async getProductByIdOrSlug(idOrSlug: string) {
    let product: any;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idOrSlug).populate('category').lean();
    }
    if (!product) {
      product = await Product.findOne({ slug: idOrSlug }).populate('category').lean();
    }
    if (!product) {
      return null;
    }

    // Fetch related products in same category
    const relatedProducts = await Product.find({
      categorySlug: product.categorySlug,
      _id: { $ne: product._id },
    })
      .limit(4)
      .lean();

    // Fetch recent reviews
    const recentReviews = await Review.find({ product: product._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      product,
      relatedProducts,
      recentReviews,
    };
  }

  async getLightningDeals() {
    return Product.find({ isLightningDeal: true })
      .limit(10)
      .sort({ discountPercentage: -1 })
      .lean();
  }

  async getCategories() {
    return Category.find({}).sort({ order: 1 }).lean();
  }
}

export const productService = new ProductService();
