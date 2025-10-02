import mongoose, { Document, Schema } from 'mongoose';

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

export interface PaymentLinkData {
  id: string;
  slug: string;
  type: 'product' | 'general';
  name: string;
  description?: string;
  amount?: number;
  currency: string;
  url: string;
  paymentIntentId?: string;
  clientSecret?: string | null;
  status: 'active' | 'inactive';
  sellerId: string;
}

interface PaymentLinkModel extends mongoose.Model<IPaymentLink> {
  findBySlug(slug: string): Promise<IPaymentLink | null>;
  findBySeller(sellerId: string): Promise<IPaymentLink[]>;
  updateStatus(slug: string, status: 'active' | 'inactive'): Promise<IPaymentLink | null>;
}

const PaymentLinkSchema = new Schema<IPaymentLink>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['product', 'general'],
    required: true,
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
    default: 'usd',
    lowercase: true,
  },
  url: {
    type: String,
    required: true,
  },
  paymentIntentId: {
    type: String,
  },
  clientSecret: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true,
  },
  sellerId: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Static methods
PaymentLinkSchema.statics.findBySlug = async function(slug: string): Promise<IPaymentLink | null> {
  return await this.findOne({ slug: slug.toLowerCase() });
};

PaymentLinkSchema.statics.findBySeller = async function(sellerId: string): Promise<IPaymentLink[]> {
  return await this.find({ 
    sellerId: sellerId.toLowerCase() 
  }).sort({ createdAt: -1 });
};

PaymentLinkSchema.statics.updateStatus = async function(
  slug: string, 
  status: 'active' | 'inactive'
): Promise<IPaymentLink | null> {
  return await this.findOneAndUpdate(
    { slug: slug.toLowerCase() },
    { status },
    { new: true }
  );
};

// Create the model
const PaymentLink = mongoose.models.PaymentLink as PaymentLinkModel || 
  mongoose.model<IPaymentLink, PaymentLinkModel>('PaymentLink', PaymentLinkSchema);

export default PaymentLink;
