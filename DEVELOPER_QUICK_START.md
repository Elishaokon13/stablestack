# StableStack - Developer Quick Start Guide

> **Get up and running with StableStack in minutes**

## 🚀 Quick Setup

### 1. Prerequisites
```bash
# Required software
node --version  # Should be 18+
npm --version   # Should be 8+
```

### 2. Installation
```bash
# Clone and install
git clone https://github.com/Elishaokon13/stablestack.git
cd stablestack
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp config/env.example .env.local

# Edit with your values
nano .env.local
```

**Required Environment Variables:**
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Stripe (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

### 4. Start Development
```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🏗️ Key Components Overview

### Database Models
```typescript
// User - Wallet-based authentication
User { walletAddress, email?, username?, isOnboardingComplete }

// Product - Items for sale
Product { sellerId, name, description, priceUSD, priceUSDC, paymentLink, isActive }

// Payment - Transaction records
Payment { productId, sellerId, buyerId, amountUSDC, status, transactionHash? }

// PaymentLink - Shareable payment URLs
PaymentLink { slug, type, name, amount?, currency, url, status }
```

### API Endpoints
```bash
# Payment Links
POST /api/payment-links/create    # Create payment link
GET  /api/payment-links/[slug]    # Get payment link details

# Products
GET  /api/products                 # List products
POST /api/products                # Create product
PUT  /api/products                # Update product

# Payments
GET  /api/payments                # List payments
POST /api/payments                # Create payment
PUT  /api/payments                # Update payment status

# Analytics
GET  /api/analytics               # Get analytics data
```

### Main React Components
```typescript
// Payment Link Generator
<PaymentLinkGenerator />           // Create and manage payment links

// System Monitor
<SystemMonitor />                 // Real-time system monitoring

// Reconciliation Dashboard
<ReconciliationDashboard />       // Payment reconciliation

// Authentication
<ReownProvider />                 // Web3 wallet connection
<WalletAuth />                    // Wallet authentication
```

---

## 🔧 Development Workflow

### 1. Adding New Features
```bash
# Create new component
touch components/feature/NewFeature.tsx

# Create new API route
mkdir app/api/new-feature
touch app/api/new-feature/route.ts

# Create new page
mkdir app/new-page
touch app/new-page/page.tsx
```

### 2. Database Operations
```typescript
// Connect to database
import connectDB from '@/lib/database';

// Use models
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import Payment from '@/lib/models/Payment';
import PaymentLink from '@/lib/models/PaymentLink';

// Example: Create a product
await connectDB();
const product = await Product.create({
  sellerId: '0x123...',
  name: 'My Product',
  description: 'Product description',
  priceUSD: 100,
  priceUSDC: '100000000', // 100 USDC (6 decimals)
  paymentLink: 'unique-slug'
});
```

### 3. Stripe Integration
```typescript
import { getStripeServer } from '@/lib/stripe';

// Create payment intent
const stripe = getStripeServer();
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1000, // $10.00
  currency: 'usd',
  metadata: { productId: '123' }
});
```

---

## 🎨 UI Development

### Styling with Tailwind
```typescript
// Component styling
<div className="bg-gray-900 text-white p-4 rounded-lg">
  <h1 className="text-2xl font-bold">Title</h1>
  <p className="text-gray-300">Description</p>
</div>
```

### Using UI Components
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Example usage
<Card>
  <CardHeader>
    <CardTitle>Payment Form</CardTitle>
  </CardHeader>
  <CardContent>
    <Input placeholder="Enter amount" />
    <Button>Submit Payment</Button>
  </CardContent>
</Card>
```

### Animations with Framer Motion
```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

---

## 🧪 Testing

### Manual Testing
```bash
# Test payment link creation
curl -X POST http://localhost:3000/api/payment-links/create \
  -H "Content-Type: application/json" \
  -d '{"type": "product", "name": "Test Product", "amount": 1000}'

# Test payment link retrieval
curl http://localhost:3000/api/payment-links/pl_1234567890_abcdef

# Test Stripe configuration
node scripts/check-stripe-config.js
```

### Database Testing
```bash
# Test MongoDB connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Connection failed:', err));
"
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module" errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database connection failed
```bash
# Check MongoDB URI format
echo $MONGODB_URI
# Should be: mongodb+srv://username:password@cluster.mongodb.net/database_name
```

### Issue: Stripe API errors
```bash
# Test Stripe configuration
node scripts/check-stripe-config.js
# Check API keys in Stripe dashboard
```

### Issue: Build failures
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

---

## 📊 Monitoring & Debugging

### Development Tools
```bash
# View logs
npm run dev 2>&1 | tee logs.txt

# Check database connection
node -e "require('./lib/database').default().then(() => console.log('✅ DB Connected')).catch(console.error)"

# Test Stripe configuration
node scripts/check-stripe-config.js
```

### Browser DevTools
- **Network Tab**: Monitor API calls
- **Console**: Check for JavaScript errors
- **Application Tab**: Inspect localStorage/sessionStorage

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Stripe webhooks configured
- [ ] Build successful (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)

### Production Environment Variables
```bash
# Required for production
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 📚 Quick Reference

### File Structure
```
app/
├── api/                    # API routes
├── dashboard/              # Dashboard pages
├── pay/[slug]/            # Payment pages
└── payment-links/         # Payment link management

components/
├── auth/                  # Authentication
├── payment/               # Payment components
├── ui/                    # Base UI components
└── monitoring/            # System monitoring

lib/
├── models/                # Database models
├── stripe.ts              # Stripe configuration
└── database.ts            # Database connection
```

### Key Functions
```typescript
// Database connection
import connectDB from '@/lib/database';

// Stripe operations
import { getStripeServer } from '@/lib/stripe';

// Model operations
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import Payment from '@/lib/models/Payment';
import PaymentLink from '@/lib/models/PaymentLink';
```

### Common Patterns
```typescript
// API Route Pattern
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Your logic here
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 });
  }
}

// Component Pattern
export default function ComponentName() {
  const [state, setState] = useState();
  
  useEffect(() => {
    // Side effects
  }, []);
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

*For detailed documentation, see `CODEBASE_DOCUMENTATION.md`*
