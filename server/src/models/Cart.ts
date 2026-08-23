import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  _id?: string;
  product: mongoose.Types.ObjectId | any;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  selected: boolean;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  savedForLater: ICartItem[];
  subtotal: number;
  totalDiscount: number;
  deliveryFee: number;
  estimatedTax: number;
  total: number;
}

const CartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: String },
  variantName: { type: String },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true, min: 0 },
  selected: { type: Boolean, default: true },
});

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: [CartItemSchema],
    savedForLater: [CartItemSchema],
    subtotal: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    estimatedTax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
