import mongoose, { Document, Schema } from 'mongoose';

export interface IVariant {
  _id?: string;
  type: 'color' | 'storage' | 'size' | 'style';
  name: string;
  priceDelta: number;
  stock: number;
  image?: string;
  sku: string;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  brand: string;
  category: mongoose.Types.ObjectId | any;
  categorySlug: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  numReviews: number;
  stock: number;
  images: string[];
  thumbnail: string;
  variants: IVariant[];
  isPrimeEligible: boolean;
  isBestSeller: boolean;
  isAmazonChoice: boolean;
  isLightningDeal: boolean;
  lightningDealEndsAt?: Date;
  lightningDealClaimedPercentage?: number;
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
}

const VariantSchema = new Schema<IVariant>({
  type: { type: String, required: true, enum: ['color', 'storage', 'size', 'style'] },
  name: { type: String, required: true, trim: true },
  priceDelta: { type: Number, default: 0 },
  stock: { type: Number, default: 10 },
  image: { type: String },
  sku: { type: String, required: true, trim: true },
});

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    categorySlug: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    originalPrice: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    rating: { type: Number, default: 4.5, min: 0, max: 5, index: true },
    numReviews: { type: Number, default: 0, min: 0 },
    stock: { type: Number, required: true, default: 15, min: 0 },
    images: [{ type: String, required: true }],
    thumbnail: { type: String, required: true },
    variants: [VariantSchema],
    isPrimeEligible: { type: Boolean, default: true, index: true },
    isBestSeller: { type: Boolean, default: false },
    isAmazonChoice: { type: Boolean, default: false },
    isLightningDeal: { type: Boolean, default: false, index: true },
    lightningDealEndsAt: { type: Date },
    lightningDealClaimedPercentage: { type: Number, default: 0 },
    features: [{ type: String }],
    specifications: { type: Map, of: String },
    tags: [{ type: String, index: true }],
  },
  {
    timestamps: true,
  }
);

// Compound text index for fuzzy search and keywords
ProductSchema.index({
  title: 'text',
  description: 'text',
  brand: 'text',
  tags: 'text',
});

// Compound indexing for multi-attribute filtering & sorting
ProductSchema.index({ categorySlug: 1, price: 1, rating: -1 });
ProductSchema.index({ isPrimeEligible: 1, price: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
