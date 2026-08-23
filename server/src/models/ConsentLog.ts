import mongoose, { Document, Schema } from 'mongoose';

export interface IConsentLog extends Document {
  user?: mongoose.Types.ObjectId;
  ipAddress: string;
  userAgent?: string;
  consentType: 'essential' | 'analytics' | 'marketing' | 'all';
  action: 'granted' | 'revoked' | 'updated';
  preferences: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  noticeVersion: string;
  timestamp: Date;
}

const ConsentLogSchema = new Schema<IConsentLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    consentType: { type: String, required: true, enum: ['essential', 'analytics', 'marketing', 'all'] },
    action: { type: String, required: true, enum: ['granted', 'revoked', 'updated'] },
    preferences: {
      essential: { type: Boolean, default: true },
      analytics: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
    },
    noticeVersion: { type: String, default: 'DPDP-2023-V1.0' },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
  }
);

export const ConsentLog = mongoose.model<IConsentLog>('ConsentLog', ConsentLogSchema);
