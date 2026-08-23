import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses: IAddress[];
  isEmailVerified: boolean;
  emailVerifiedAt?: Date;
  isAnonymized: boolean;
  anonymizedAt?: Date;
  consentSettings: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    updatedAt: Date;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  getMaskedData(): any;
}

const AddressSchema = new Schema<IAddress>({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true },
  apartment: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, default: 'India', trim: true },
  isDefault: { type: Boolean, default: false },
  type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    phone: { type: String, trim: true },
    addresses: [AddressSchema],
    isEmailVerified: { type: Boolean, default: false, index: true },
    emailVerifiedAt: { type: Date },
    isAnonymized: { type: Boolean, default: false },
    anonymizedAt: { type: Date },
    consentSettings: {
      essential: { type: Boolean, default: true },
      analytics: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
      updatedAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// DPDP compliant PII masking method
UserSchema.methods.getMaskedData = function () {
  const obj = this.toObject();
  delete obj.password;

  if (obj.phone) {
    obj.phone = obj.phone.replace(/(\d{2})\d+(\d{3})/, '$1*****$2');
  }

  return obj;
};

export const User = mongoose.model<IUser>('User', UserSchema);
