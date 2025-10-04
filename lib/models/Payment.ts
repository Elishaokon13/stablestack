import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  productId: string;
  sellerId: string; // User address
  buyerId: string; // User address
  amountUSDC: string; // BigInt as string for precision
  amountUSD?: number; // USD amount for Stripe
  stripePaymentIntentId?: string; // Stripe payment intent ID
  stripeMetadata?: Record<string, string>; // Stripe metadata
  transactionHash?: string;
  blockradarTransactionId?: string; // Blockradar transaction ID
  payoutStatus?: 'initiated' | 'completed' | 'failed' | 'retrying'; // Payout status
  payoutInitiatedAt?: Date;
  payoutCompletedAt?: Date;
  payoutFailedAt?: Date;
  payoutRetriedAt?: Date;
  payoutRetryCount?: number;
  payoutRetryReason?: string;
  payoutFailureReason?: string;
  payoutTransactionHash?: string;
  refundStatus?: 'initiated' | 'completed' | 'failed';
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  refundMetadata?: Record<string, string>;
  refundedAt?: Date;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentLink: string;
  buyerEmail?: string;
  buyerName?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>({
  productId: {
    type: String,
    required: true,
    index: true,
  },
  sellerId: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  buyerId: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  amountUSDC: {
    type: String,
    required: true,
  },
  amountUSD: {
    type: Number,
    min: 0,
  },
  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  stripeMetadata: {
    type: Map,
    of: String,
  },
  transactionHash: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  blockradarTransactionId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  payoutStatus: {
    type: String,
    enum: ['initiated', 'completed', 'failed', 'retrying'],
    index: true,
  },
  payoutInitiatedAt: {
    type: Date,
  },
  payoutCompletedAt: {
    type: Date,
  },
  payoutFailedAt: {
    type: Date,
  },
  payoutRetriedAt: {
    type: Date,
  },
  payoutRetryCount: {
    type: Number,
    default: 0,
  },
  payoutRetryReason: {
    type: String,
  },
  payoutFailureReason: {
    type: String,
  },
  payoutTransactionHash: {
    type: String,
  },
  refundStatus: {
    type: String,
    enum: ['initiated', 'completed', 'failed'],
  },
  refundId: {
    type: String,
  },
  refundAmount: {
    type: Number,
    min: 0,
  },
  refundReason: {
    type: String,
  },
  refundMetadata: {
    type: Map,
    of: String,
  },
  refundedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  paymentLink: {
    type: String,
    required: true,
    index: true,
  },
  buyerEmail: {
    type: String,
    lowercase: true,
  },
  buyerName: {
    type: String,
    trim: true,
  },
  failureReason: {
    type: String,
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Static methods
PaymentSchema.statics.create = async function(paymentData: {
  productId: string;
  sellerId: string;
  buyerId: string;
  amountUSDC: string;
  paymentLink: string;
  buyerEmail?: string;
  buyerName?: string;
}) {
  const payment = new this(paymentData);
  return await payment.save();
};

PaymentSchema.statics.findByTransactionHash = async function(transactionHash: string) {
  return await this.findOne({ transactionHash });
};

PaymentSchema.statics.findBySeller = async function(sellerId: string) {
  return await this.find({ 
    sellerId: sellerId.toLowerCase() 
  }).sort({ createdAt: -1 });
};

PaymentSchema.statics.findByBuyer = async function(buyerId: string) {
  return await this.find({ 
    buyerId: buyerId.toLowerCase() 
  }).sort({ createdAt: -1 });
};

PaymentSchema.statics.findByProduct = async function(productId: string) {
  return await this.find({ productId }).sort({ createdAt: -1 });
};

PaymentSchema.statics.findByPaymentLink = async function(paymentLink: string) {
  return await this.find({ 
    paymentLink: paymentLink.toLowerCase() 
  }).sort({ createdAt: -1 });
};

PaymentSchema.statics.updateStatus = async function(paymentId: string, status: string, transactionHash?: string) {
  const updateData: any = { 
    status, 
    updatedAt: new Date() 
  };
  
  if (transactionHash) {
    updateData.transactionHash = transactionHash;
  }
  
  if (status === 'completed') {
    updateData.completedAt = new Date();
  }
  
  return await this.findByIdAndUpdate(paymentId, updateData, { new: true });
};

PaymentSchema.statics.markCompleted = async function(transactionHash: string) {
  return await this.findOneAndUpdate(
    { transactionHash },
    { 
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date()
    },
    { new: true }
  );
};

PaymentSchema.statics.getSellerEarnings = async function(sellerId: string) {
  const payments = await this.find({
    sellerId: sellerId.toLowerCase(),
    status: 'completed'
  });
  
  const totalEarnings = payments.reduce((sum: number, payment: any) => {
    return sum + parseInt(payment.amountUSDC);
  }, 0);
  
  return {
    totalPayments: payments.length,
    totalEarningsUSDC: totalEarnings.toString(),
    totalEarningsUSD: (totalEarnings / 1e6).toFixed(2), // Convert from USDC to USD
  };
};

PaymentSchema.statics.getRecentPayments = async function(sellerId: string, limit: number = 10) {
  return await this.find({
    sellerId: sellerId.toLowerCase(),
    status: 'completed'
  })
  .sort({ completedAt: -1 })
  .limit(limit)
  .populate('productId', 'name priceUSD');
};

const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
