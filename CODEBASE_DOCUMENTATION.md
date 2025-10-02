# StableStack - Complete Codebase Documentation

> **A comprehensive guide to understanding the StableStack payment link generator application**

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Project Structure](#project-structure)
4. [Database Models](#database-models)
5. [API Endpoints](#api-endpoints)
6. [React Components](#react-components)
7. [Payment Flow](#payment-flow)
8. [Authentication & Security](#authentication--security)
9. [Configuration & Environment](#configuration--environment)
10. [Development Guide](#development-guide)
11. [Deployment](#deployment)

---

## 🎯 Project Overview

**StableStack** is a modern payment platform that bridges traditional finance and cryptocurrency. It allows users to:

- **Generate Payment Links**: Create shareable payment links for products or general payments
- **Accept Card Payments**: Process payments via Stripe integration
- **Receive Stablecoins**: Automatically convert card payments to stablecoins via Blockradar
- **Track Analytics**: Monitor payments, reconciliation, and system performance

### Key Features

- 💳 **Stripe Integration**: Secure card payment processing
- 🔗 **Payment Link Generation**: Create and manage payment links
- 💰 **Stablecoin Management**: Automatic conversion to USDC/USDT
- 📊 **Analytics Dashboard**: Real-time monitoring and reporting
- 🎨 **Modern UI**: Responsive design with Tailwind CSS
- 🔒 **Security**: PCI-compliant payment processing

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Next.js 15.2.4** - React framework with App Router
- **React 19** - Latest React features with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.1.9** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - Document database with Mongoose ODM
- **Stripe API** - Payment processing
- **Blockradar API** - Crypto wallet management

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Vercel Analytics** - Performance monitoring

---

## 📁 Project Structure

```
stablestack/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── analytics/            # Analytics data
│   │   ├── auth/                 # Authentication
│   │   ├── payment-links/        # Payment link management
│   │   ├── payments/             # Payment processing
│   │   ├── products/             # Product management
│   │   ├── users/                # User management
│   │   └── verify-payment/        # Payment verification
│   ├── dashboard/                # Main dashboard
│   ├── demo/                     # Demo page
│   ├── pay/[slug]/               # Payment pages
│   ├── payment-links/            # Payment link management
│   ├── payments/                 # Payment history
│   ├── products/                 # Product management
│   └── test-wallet/              # Wallet testing
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── cards/                    # Card components
│   ├── dashboard/                # Dashboard components
│   ├── forms/                    # Form components
│   ├── icons/                    # Custom icons
│   ├── monitoring/               # System monitoring
│   ├── payment/                  # Payment components
│   ├── payout/                   # Payout components
│   ├── reconciliation/           # Reconciliation components
│   └── ui/                       # Base UI components
├── lib/                          # Utility libraries
│   ├── models/                   # Database models
│   └── types/                    # TypeScript types
├── hooks/                        # Custom React hooks
├── config/                       # Configuration files
└── public/                       # Static assets
```

---

## 🗄️ Database Models

### User Model (`lib/models/User.ts`)
```typescript
interface IUser {
  walletAddress: string;           // Primary identifier
  email?: string;                 // Optional email
  username?: string;               // Optional username
  isOnboardingComplete: boolean;  // Onboarding status
  createdAt: Date;
  updatedAt: Date;
}
```

**Key Features:**
- Wallet address as primary identifier
- Email and username are optional
- Onboarding completion tracking
- Legacy address field for backward compatibility

### Product Model (`lib/models/Product.ts`)
```typescript
interface IProduct {
  sellerId: string;               // User wallet address
  name: string;                   // Product name
  description: string;            // Product description
  priceUSD: number;               // Price in USD
  priceUSDC: string;              // Price in USDC (BigInt as string)
  paymentLink: string;            // Unique payment link slug
  isActive: boolean;              // Product status
  imageUrl?: string;              // Optional product image
  category?: string;              // Product category
  createdAt: Date;
  updatedAt: Date;
}
```

**Key Features:**
- Links to seller via wallet address
- Dual pricing (USD and USDC)
- Unique payment link generation
- Active/inactive status management

### Payment Model (`lib/models/Payment.ts`)
```typescript
interface IPayment {
  productId: string;              // Reference to product
  sellerId: string;               // Seller wallet address
  buyerId: string;                // Buyer wallet address
  amountUSDC: string;             // Payment amount in USDC
  transactionHash?: string;       // Blockchain transaction hash
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentLink: string;            // Payment link used
  buyerEmail?: string;            // Optional buyer email
  buyerName?: string;             // Optional buyer name
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;             // Completion timestamp
}
```

**Key Features:**
- Links to product and users
- Payment status tracking
- Optional buyer information
- Blockchain transaction tracking

### PaymentLink Model (`lib/models/PaymentLink.ts`)
```typescript
interface IPaymentLink {
  id: string;                     // Unique identifier
  slug: string;                    // URL slug
  type: 'product' | 'general';     // Link type
  name: string;                    // Link name
  description?: string;           // Optional description
  amount?: number;                 // Fixed amount (for products)
  currency: string;                // Currency code
  url: string;                     // Full payment URL
  paymentIntentId?: string;        // Stripe payment intent ID
  clientSecret?: string;           // Stripe client secret
  status: 'active' | 'inactive';   // Link status
  sellerId: string;               // Creator wallet address
  createdAt: Date;
  updatedAt: Date;
}
```

**Key Features:**
- Flexible link types (product vs general)
- Stripe integration fields
- Status management
- URL generation

---

## 🔌 API Endpoints

### Payment Links API

#### `POST /api/payment-links/create`
Creates a new payment link.

**Request Body:**
```typescript
{
  type: 'product' | 'general';
  name: string;
  description?: string;
  amount?: number;  // Required for product type
  currency?: string; // Defaults to 'usd'
}
```

**Response:**
```typescript
{
  id: string;
  slug: string;
  type: string;
  name: string;
  description?: string;
  amount?: number;
  currency: string;
  url: string;
  paymentIntentId?: string;
  clientSecret?: string;
  status: 'active';
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `GET /api/payment-links/[slug]`
Retrieves payment link details.

**Response:**
```typescript
{
  success: boolean;
  product: {
    id: string;
    sellerId: string;
    name: string;
    description: string;
    priceUSD: number;
    priceUSDC: string;
    paymentLink: string;
    isActive: boolean;
    category: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

### Products API

#### `GET /api/products`
Retrieves products with optional filtering.

**Query Parameters:**
- `sellerId` - Filter by seller
- `paymentLink` - Get single product by payment link

#### `POST /api/products`
Creates a new product.

**Request Body:**
```typescript
{
  sellerId: string;
  name: string;
  description: string;
  priceUSD: number;
  imageUrl?: string;
  category?: string;
}
```

### Payments API

#### `GET /api/payments`
Retrieves payment history with filtering.

**Query Parameters:**
- `sellerId` - Filter by seller
- `buyerId` - Filter by buyer
- `status` - Filter by payment status

#### `POST /api/payments`
Creates a new payment record.

**Request Body:**
```typescript
{
  productId: string;
  buyerId: string;
  buyerEmail?: string;
  buyerName?: string;
}
```

### Analytics API

#### `GET /api/analytics`
Retrieves analytics data.

**Response:**
```typescript
{
  totalPayments: number;
  totalRevenue: number;
  averagePayment: number;
  paymentStatus: {
    pending: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  recentPayments: Payment[];
  topProducts: Product[];
}
```

---

## ⚛️ React Components

### Core Components

#### `PaymentLinkGenerator` (`components/payment/payment-link-generator.tsx`)
Main component for creating and managing payment links.

**Features:**
- Form for creating payment links
- List of existing payment links
- Copy-to-clipboard functionality
- Real-time status updates

#### `SystemMonitor` (`components/monitoring/system-monitor.tsx`)
Real-time system monitoring dashboard.

**Features:**
- System status indicators
- Performance metrics
- Alert management
- Uptime tracking

#### `ReconciliationDashboard` (`components/reconciliation/reconciliation-dashboard.tsx`)
Payment reconciliation interface.

**Features:**
- Payment matching
- Discrepancy detection
- Manual reconciliation tools
- Export functionality

### Authentication Components

#### `ReownProvider` (`components/auth/Reown.tsx`)
Web3 wallet connection provider.

**Features:**
- Wallet connection management
- Session persistence
- Error handling
- Loading states

#### `WalletAuth` (`components/auth/index.ts`)
Wallet authentication wrapper.

**Features:**
- Wallet status checking
- Authentication flow
- User session management

### Form Components

#### `OnboardingForm` (`components/forms/Onboarding.tsx`)
User onboarding form.

**Features:**
- Multi-step form
- Validation
- Progress tracking
- Data persistence

#### `ProductForm` (`components/forms/Product.tsx`)
Product creation and editing form.

**Features:**
- Product details input
- Image upload
- Category selection
- Price validation

### UI Components

#### `Sidebar` (`components/dashboard/sidebar/index.tsx`)
Main navigation sidebar.

**Features:**
- Navigation menu
- User profile
- Status indicators
- Responsive design

#### `ProductCard` (`components/cards/Product.tsx`)
Product display card.

**Features:**
- Product information display
- Action buttons
- Status indicators
- Responsive layout

---

## 💳 Payment Flow

### 1. Payment Link Creation
```mermaid
graph TD
    A[User creates payment link] --> B[Validate form data]
    B --> C[Generate unique slug]
    C --> D[Create Stripe payment intent]
    D --> E[Store in database]
    E --> F[Return payment URL]
```

### 2. Payment Processing
```mermaid
graph TD
    A[Customer visits payment link] --> B[Load product details]
    B --> C[Display payment form]
    C --> D[Customer enters payment info]
    D --> E[Stripe processes payment]
    E --> F[Webhook confirms payment]
    F --> G[Update payment status]
    G --> H[Send stablecoins to merchant]
```

### 3. Database Persistence
```mermaid
graph TD
    A[Payment Link Created] --> B[Stored in PaymentLink collection]
    B --> C[Payment Made] --> D[Stored in Payment collection]
    D --> E[Product Referenced] --> F[Stored in Product collection]
    F --> G[User Data] --> H[Stored in User collection]
```

---

## 🔐 Authentication & Security

### Wallet Authentication
- **Web3 Integration**: Uses Reown (WalletConnect) for wallet connections
- **Session Management**: Persistent authentication state
- **Address Validation**: Ethereum address format validation

### Payment Security
- **Stripe Integration**: PCI-compliant payment processing
- **Webhook Verification**: Secure webhook signature validation
- **Input Validation**: Comprehensive data sanitization
- **HTTPS Only**: Secure communication protocols

### Database Security
- **MongoDB Atlas**: Secure cloud database
- **Connection Encryption**: TLS/SSL connections
- **Access Control**: Role-based permissions
- **Data Validation**: Mongoose schema validation

---

## ⚙️ Configuration & Environment

### Environment Variables

#### Core Application
```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

#### Stripe Configuration
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_DEFAULT_CURRENCY=usd
```

#### Database Configuration
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
```

#### Blockchain Configuration
```bash
ALCHEMY_API_KEY=your_alchemy_api_key
TREASURY_PRIVATE_KEY=your_treasury_wallet_private_key
```

#### Blockradar Configuration
```bash
BLOCKRADAR_API_KEY=your_blockradar_api_key
BLOCKRADAR_WALLET_ID=your_wallet_id
BLOCKRADAR_SUPPORTED_TOKENS=USDC,USDT,DAI
```

### Configuration Files

#### `lib/stripe.ts`
Stripe configuration and utility functions.

**Key Functions:**
- `getStripeServer()` - Get server-side Stripe instance
- `createPaymentIntent()` - Create payment intent
- `verifyWebhookSignature()` - Verify webhook signatures

#### `lib/database.ts`
MongoDB connection management.

**Features:**
- Connection pooling
- Error handling
- Development/production configurations

#### `lib/stripe-config-checker.ts`
Stripe configuration validation.

**Features:**
- API connectivity testing
- Configuration validation
- Recommendations for improvements

---

## 🛠️ Development Guide

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Stripe account
- Alchemy account (for blockchain features)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Elishaokon13/stablestack.git
   cd stablestack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp config/env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Code Organization

#### File Naming Conventions
- **Components**: PascalCase (`PaymentLinkGenerator.tsx`)
- **Pages**: lowercase (`payment-links/page.tsx`)
- **API Routes**: lowercase (`api/payment-links/route.ts`)
- **Utilities**: camelCase (`payment-links-store.ts`)

#### Component Structure
```typescript
// Component imports
import React from 'react';
import { useState, useEffect } from 'react';

// Type definitions
interface ComponentProps {
  // Props interface
}

// Main component
export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

#### API Route Structure
```typescript
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Model from '@/lib/models/Model';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // GET logic
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    // POST logic
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 });
  }
}
```

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Enable automatic deployments

2. **Configure Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Ensure production values are used

3. **Deploy**
   - Push to main branch triggers automatic deployment
   - Monitor deployment logs for any issues

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Stripe webhooks configured
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Analytics tracking enabled

---

## 📊 Monitoring & Analytics

### System Monitoring
- **Uptime Tracking**: Monitor application availability
- **Performance Metrics**: Track response times and throughput
- **Error Tracking**: Log and monitor application errors
- **Resource Usage**: Monitor CPU, memory, and database usage

### Payment Analytics
- **Transaction Volume**: Track payment amounts and frequency
- **Success Rates**: Monitor payment completion rates
- **Revenue Tracking**: Calculate total revenue and trends
- **User Behavior**: Analyze user interaction patterns

### Reconciliation
- **Payment Matching**: Match Stripe payments with stablecoin receipts
- **Discrepancy Detection**: Identify and flag payment discrepancies
- **Audit Trails**: Maintain comprehensive payment audit logs
- **Reporting**: Generate financial reports and summaries

---

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check MongoDB connection
node -e "require('./lib/database').default().then(() => console.log('Connected')).catch(console.error)"
```

#### Stripe Configuration Issues
```bash
# Test Stripe configuration
node scripts/check-stripe-config.js
```

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
DEBUG=stablestack:*
```

---

## 📚 Additional Resources

### Documentation Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Support
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check this file for detailed explanations
- **Community**: Join our Discord for community support

---

## 🎯 Future Enhancements

### Planned Features
- **Multi-currency Support**: Support for additional currencies
- **Advanced Analytics**: Enhanced reporting and insights
- **Mobile App**: Native mobile application
- **API Rate Limiting**: Implement rate limiting for API endpoints
- **Advanced Security**: Additional security measures and monitoring

### Technical Improvements
- **Performance Optimization**: Improve loading times and responsiveness
- **Code Splitting**: Implement advanced code splitting strategies
- **Caching**: Add Redis caching for improved performance
- **Testing**: Comprehensive test suite implementation

---

*This documentation is maintained alongside the codebase. For the most up-to-date information, refer to the source code and commit history.*
