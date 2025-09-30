import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  sellerId: string; // User address
  name: string;
  description: string;
  priceUSD: number;
  priceUSDC: string; // BigInt as string for precision
  paymentLink: string; // Unique slug for payment URL
  isActive: boolean;
  imageUrl?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  sellerId: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  priceUSD: {
    type: Number,
    required: true,
    min: 0,
  },
  priceUSDC: {
    type: String,
    required: true,
  },
  paymentLink: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  imageUrl: {
    type: String,
  },
  category: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Static methods
ProductSchema.statics.create = async function(productData: {
  sellerId: string;
  name: string;
  description: string;
  priceUSD: number;
  priceUSDC: string;
  paymentLink: string;
  imageUrl?: string;
  category?: string;
}) {
  const product = new this(productData);
  return await product.save();
};

ProductSchema.statics.findByPaymentLink = async function(paymentLink: string) {
  return await this.findOne({ 
    paymentLink: paymentLink.toLowerCase(),
    isActive: true 
  });
};

ProductSchema.statics.findBySeller = async function(sellerId: string) {
  // Check if sellerId is a wallet address (starts with 0x) or ObjectId
  if (sellerId.startsWith('0x')) {
    // It's a wallet address, search by wallet address
    return await this.find({ 
      sellerId: sellerId.toLowerCase() 
    }).sort({ createdAt: -1 });
  } else {
    // It's an ObjectId, search by ObjectId
    return await this.find({ 
      sellerId: new mongoose.Types.ObjectId(sellerId)
    }).sort({ createdAt: -1 });
  }
};

ProductSchema.statics.findActiveBySeller = async function(sellerId: string) {
  return await this.find({ 
    sellerId: sellerId.toLowerCase(),
    isActive: true 
  }).sort({ createdAt: -1 });
};

ProductSchema.statics.updateStatus = async function(productId: string, isActive: boolean) {
  return await this.findByIdAndUpdate(
    productId,
    { isActive, updatedAt: new Date() },
    { new: true }
  );
};

ProductSchema.statics.generatePaymentLink = async function(name: string) {
  // Convert name to URL-friendly slug
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Ensure it's not empty
  if (!slug) {
    slug = 'product';
  }
  
  let finalSlug = slug;
  let counter = 1;
  
  // Check if slug exists and make it unique
  while (await this.findOne({ paymentLink: finalSlug })) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return finalSlug;
};

// Convert USD to USDC (assuming 1 USD = 1 USDC for simplicity)
ProductSchema.statics.convertUSDToUSDC = function(priceUSD: number): string {
  // Convert to wei (18 decimals) for USDC
  const usdcAmount = Math.round(priceUSD * 1e6); // USDC has 6 decimals
  return usdcAmount.toString();
};

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
