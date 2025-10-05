// Core payment and product types for Paystack for Web3

export interface Product {
  id: string;
  sellerId: string; // Wallet address of the seller
  name: string;
  description: string;
  price: number; // Price in USD
  priceInUSDC: string; // Price in USDC (6 decimals)
  imageUrl?: string;
  category: ProductCategory;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
  paymentUrl: string;
  isActive: boolean;
}

export interface Payment {
  id: string;
  productId: string;
  buyerId: string; // Wallet address of the buyer
  sellerId: string; // Wallet address of the seller
  amount: number; // Amount in USD
  amountInUSDC: string; // Amount in USDC (6 decimals)
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionHash?: string; // Blockchain transaction hash
  stripePaymentIntentId?: string; // Stripe payment intent ID
  createdAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  fromAddress: string;
  toAddress: string;
  amount: string; // Amount in USDC (6 decimals)
  tokenAddress: string; // USDC contract address
  chainId: number;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  status: TransactionStatus;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface Wallet {
  address: string;
  chainId: number;
  isConnected: boolean;
  balance: string; // USDC balance (6 decimals)
  lastActivity: Date;
  createdAt: Date;
}

export interface SellerProfile {
  walletAddress: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  totalEarnings: string; // Total earnings in USDC
  totalProducts: number;
  totalSales: number;
  rating: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BuyerProfile {
  walletAddress: string;
  name?: string;
  avatarUrl?: string;
  totalSpent: string; // Total spent in USDC
  totalPurchases: number;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum ProductCategory {
  DIGITAL_GOODS = 'digital_goods',
  PHYSICAL_GOODS = 'physical_goods',
  SERVICES = 'services',
  NFT = 'nft',
  SUBSCRIPTION = 'subscription',
  OTHER = 'other'
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SOLD_OUT = 'sold_out',
  ARCHIVED = 'archived'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto',
  WALLET = 'wallet'
}

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  FEE = 'fee'
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface CreateProductForm {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

export interface UpdateProductForm extends Partial<CreateProductForm> {
  id: string;
  status?: ProductStatus;
}

export interface CreatePaymentForm {
  productId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  buyerWalletAddress: string;
}

// Dashboard analytics types
export interface DashboardStats {
  totalRevenue: string; // USDC
  totalProducts: number;
  totalSales: number;
  totalCustomers: number;
  monthlyRevenue: string; // USDC
  monthlyGrowth: number; // Percentage
}

export interface SalesAnalytics {
  daily: Array<{
    date: string;
    revenue: string;
    sales: number;
  }>;
  monthly: Array<{
    month: string;
    revenue: string;
    sales: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    sales: number;
    revenue: string;
  }>;
}

// Web3 specific types
export interface USDCContract {
  address: string;
  chainId: number;
  decimals: number;
  symbol: string;
  name: string;
}

export interface PaymentGatewayConfig {
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  usdc: {
    contractAddress: string;
    chainId: number;
    decimals: number;
  };
  reown: {
    projectId: string;
  };
}

// Error types
export interface PaymentError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
