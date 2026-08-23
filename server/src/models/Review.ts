import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  userName: string;
  product: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  variantInfo?: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true, trim: true },
    isVerifiedPurchase: { type: Boolean, default: true },
    helpfulVotes: { type: Number, default: 0 },
    variantInfo: { type: String },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate review per user per product
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
