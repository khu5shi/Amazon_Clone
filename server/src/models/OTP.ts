import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  type: 'signup' | 'login' | 'reset_password';
  attempts: number;
  createdAt: Date;
  expiresAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true },
    type: {
      type: String,
      enum: ['signup', 'login', 'reset_password'],
      default: 'signup',
    },
    attempts: { type: Number, default: 0, max: 3 },
    createdAt: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Automatic TTL expiration by MongoDB
    },
  },
  {
    timestamps: false,
  }
);

export const OTP = mongoose.model<IOTP>('OTP', OTPSchema);
