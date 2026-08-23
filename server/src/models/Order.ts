import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  title: string;
  thumbnail: string;
  price: number;
  quantity: number;
  variantName?: string;
}

export interface IStatusHistory {
  status: string;
  timestamp: Date;
  location?: string;
  notes?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'amazon_pay' | 'card' | 'upi' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDetails?: {
    transactionId?: string;
    cardLast4?: string;
    upiId?: string;
    paidAt?: Date;
  };
  deliveryMethod: 'prime_express' | 'standard';
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  orderStatus: 'Placed' | 'Confirmed' | 'Shipped' | 'OutForDelivery' | 'Delivered' | 'Cancelled';
  statusHistory: IStatusHistory[];
  trackingNumber: string;
  estimatedDeliveryDate: Date;
  isCancelled: boolean;
  cancelledAt?: Date;
  cancellationReason?: string;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  thumbnail: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variantName: { type: String },
});

const StatusHistorySchema = new Schema<IStatusHistory>({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  location: { type: String },
  notes: { type: String },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderItems: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      apartment: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    paymentMethod: {
      type: String,
      enum: ['amazon_pay', 'card', 'upi', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed',
    },
    paymentDetails: {
      transactionId: { type: String },
      cardLast4: { type: String },
      upiId: { type: String },
      paidAt: { type: Date },
    },
    deliveryMethod: {
      type: String,
      enum: ['prime_express', 'standard'],
      default: 'prime_express',
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
      index: true,
    },
    statusHistory: [StatusHistorySchema],
    trackingNumber: { type: String, required: true },
    estimatedDeliveryDate: { type: Date, required: true },
    isCancelled: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
