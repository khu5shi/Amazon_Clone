import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryZone extends Document {
  postalCode: string;
  city: string;
  state: string;
  isServiceable: boolean;
  expressDeliveryAvailable: boolean;
  standardDeliveryDays: number;
  deliveryFee: number;
  createdAt: Date;
}

const DeliveryZoneSchema = new Schema<IDeliveryZone>(
  {
    postalCode: { type: String, required: true, unique: true, trim: true, index: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    isServiceable: { type: Boolean, default: true },
    expressDeliveryAvailable: { type: Boolean, default: true },
    standardDeliveryDays: { type: Number, default: 2 },
    deliveryFee: { type: Number, default: 40 },
  },
  { timestamps: true }
);

export const DeliveryZone = mongoose.model<IDeliveryZone>('DeliveryZone', DeliveryZoneSchema);
