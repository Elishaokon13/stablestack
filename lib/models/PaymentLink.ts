import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPaymentLink extends Document {
  id: string;
  slug: string;
  type: 'product' | 'general';
  name: string;
  description?: string;
  amount?: number;
  currency: string;
  url: string;
  paymentIntentId?: string;
  clientSecret?: string;
  status: 'active' | 'inactive';
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentLinkModel extends Model<IPaymentLink> {
  findBySlug(slug: string): Promise<IPaymentLink | null>;
  findBySeller(sellerId: string): Promise<IPaymentLink[]>;
  updateStatus(slug: string, status: 'active' | 'inactive'): Promise<IPaymentLink | null>;
}

const PaymentLinkSchema: Schema<IPaymentLink> = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['product', 'general'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'usd',
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    paymentIntentId: {
      type: String,
      trim: true,
    },
    clientSecret: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    sellerId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  { timestamps: true }
);

PaymentLinkSchema.statics.findBySlug = async function (slug: string) {
  return this.findOne({ slug, status: 'active' });
};

PaymentLinkSchema.statics.findBySeller = async function (sellerId: string) {
  return this.find({ sellerId }).sort({ createdAt: -1 });
};

PaymentLinkSchema.statics.updateStatus = async function (slug: string, status: 'active' | 'inactive') {
  return this.findOneAndUpdate(
    { slug },
    { $set: { status, updatedAt: new Date() } },
    { new: true }
  );
};

export const PaymentLink = (mongoose.models.PaymentLink || mongoose.model<IPaymentLink, PaymentLinkModel>('PaymentLink', PaymentLinkSchema)) as PaymentLinkModel;