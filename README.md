# StableStack - Payment Link Generator

> **The ultimate payment link generator. Accept card payments, receive stablecoins.**

A modern payment platform that bridges traditional finance and crypto. Users can generate payment links for products or general payments, accept card payments via Stripe, and receive stablecoins through Blockradar's wallet infrastructure.

## 🚀 Features

### 💳 **Payment Processing**

- **Stripe Integration**: Accept card payments from customers worldwide
- **Multiple Payment Methods**: Credit cards, debit cards, digital wallets
- **Secure Processing**: PCI-compliant payment handling
- **Real-time Processing**: Instant payment confirmation

### 🔗 **Payment Link Generation**

- **Product Links**: Generate payment links for specific products with pricing
- **General Payment Links**: Create flexible payment links for any amount
- **Customizable Links**: Add descriptions, amounts, and metadata
- **Shareable URLs**: Easy sharing via social media, email, or messaging

### 💰 **Stablecoin Management**

- **Blockradar Integration**: Secure stablecoin wallet infrastructure
- **Automatic Conversion**: Card payments automatically converted to stablecoins
- **Multi-token Support**: USDC, USDT, and other major stablecoins
- **Real-time Balances**: Track your stablecoin holdings

### 📊 **Analytics & Monitoring**

- **Payment Tracking**: Monitor all incoming payments and transactions
- **Revenue Analytics**: Track earnings, conversion rates, and performance
- **Reconciliation**: Automatic matching of card payments to stablecoin receipts
- **Real-time Dashboard**: Live updates on payment status and balances

### 🎨 **User Experience**

- **Modern Design**: Clean, professional interface
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion powered interactions
- **Dark Mode**: Optimized for dark theme
- **Custom Components**: Tailwind CSS + Radix UI

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 15.2.4** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.1.9** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives

### **Payment Processing**

- **Stripe 7.9.0** - Card payment processing
- **Stripe React 4.0.2** - Frontend payment components
- **Blockradar API** - Stablecoin wallet management
- **Webhook Processing** - Real-time payment notifications

### **Backend & Database**

- **Next.js API Routes** - Serverless API endpoints
- **Stripe Webhooks** - Payment event handling
- **Blockradar SDK** - Crypto wallet operations
- **Real-time Updates** - Live payment status tracking

### **Development Tools**

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Vercel Analytics** - Performance monitoring
- **Auto-Commit** - Automated git commit workflow

## 📁 Project Structure

```
stablestack/
├── app/                          # Next.js App Router
│   ├── (routes)/                 # Application routes
│   │   ├── page.tsx              # Login/Signup
│   │   ├── dashboard/            # Dashboard pages
│   │   ├── products/             # Product management
│   │   ├── payments/             # Payment history
│   │   ├── analytics/            # Analytics
│   │   └── pay/[slug]/           # Public payment pages
│   ├── api/
│   │   └── webhooks/             # External webhooks only
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── lib/                          # Core library
│   ├── api/
│   │   └── client.ts             # Base API client
│   ├── hooks/                    # Domain-specific hooks
│   │   ├── payment/              # Payment hooks
│   │   │   ├── use-earnings.ts
│   │   │   ├── use-sales-heatmap.ts
│   │   │   ├── use-transactions.ts
│   │   │   ├── use-payment-intent.ts
│   │   │   └── index.ts
│   │   ├── product/              # Product hooks
│   │   │   ├── use-products.ts
│   │   │   ├── use-create-product.ts
│   │   │   ├── use-update-product.ts
│   │   │   ├── use-product-stats.ts
│   │   │   ├── use-product-analytics.ts
│   │   │   └── index.ts
│   │   ├── wallet/               # Wallet hooks
│   │   │   ├── use-wallet-balance.ts
│   │   │   ├── use-payout-transactions.ts
│   │   │   ├── use-withdraw.ts
│   │   │   └── index.ts
│   │   └── unique-name/          # Unique name hooks
│   │       ├── use-unique-name.ts
│   │       ├── use-check-unique-name.ts
│   │       └── index.ts
│   ├── types/                    # TypeScript types
│   ├── models/                   # Data models
│   └── utils.ts                  # Utilities
│
├── components/                   # React components
│   ├── auth/                     # Auth components
│   ├── dashboard/                # Dashboard components
│   ├── payment/                  # Payment components
│   ├── forms/                    # Forms
│   └── ui/                       # Base UI (shadcn/ui)
│
├── docs/                         # Documentation
│   ├── API_INTEGRATION.md        # API integration guide
│   └── FOLDER_STRUCTURE.md       # This file
│
└── public/                       # Static assets
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **Git** (for version control and auto-commit features)
- **Stripe Account** (from [dashboard.stripe.com](https://dashboard.stripe.com))
- **Blockradar API Key** (from [blockradar.com](https://blockradar.com))

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd stablestack
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp config/env.example .env.local
   ```

4. **Configure environment variables**

   ```env
   # Backend API
   NEXT_PUBLIC_API_URL=

   # Clerk Authentication (Required)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # Optional
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🤖 Auto-Commit (Optional)

Enable automatic git commits during development:

### Quick Start

```bash
# Watch mode - commits after changes stop
npm run auto-commit

# Interval mode - commits every 5 minutes
npm run auto-commit:interval
```

### Features

- ✅ Automatic commits on file changes
- ✅ Configurable delay and intervals
- ✅ Smart file exclusions (node_modules, .next, etc.)
- ✅ Optional auto-push to remote
- ✅ Graceful shutdown handling

### Configuration

Edit `.autocommitrc.json` to customize:

```json
{
  "debounceTime": 5000,
  "intervalMinutes": 5,
  "autoPush": false,
  "branch": "main"
}
```

For detailed instructions, see the auto-commit scripts in `/scripts/`.

## 🔌 API Integration

### Backend API

This project integrates with an external backend API (configured via `NEXT_PUBLIC_API_URL`).

### Custom Hooks

The codebase follows clean architecture principles with domain-specific hooks:

```typescript
// Payment hooks
import {
  useEarnings,
  useTransactions,
  useSalesHeatmap,
} from "@/lib/hooks/payment";

// Product hooks
import {
  useProducts,
  useCreateProduct,
  useProductStats,
} from "@/lib/hooks/product";

// Wallet hooks
import { useWalletBalance, useWithdraw } from "@/lib/hooks/wallet";

// Unique name hooks
import { useUniqueName, useCheckUniqueName } from "@/lib/hooks/unique-name";
```

### Example Usage

```typescript
function Dashboard() {
  const { earnings, loading } = useEarnings();
  const { transactions } = useTransactions({ limit: 5 });

  if (loading) return <Spinner />;

  return <div>Revenue: ${earnings?.total}</div>;
}
```

### Documentation

For detailed API documentation, see:

- [API Integration Guide](./docs/API_INTEGRATION.md)
- [Folder Structure](./docs/FOLDER_STRUCTURE.md)

## 🔧 Configuration

### Stripe Setup

1. **Create a Stripe account** at [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Get your API keys** from the dashboard
3. **Configure webhooks**:
   - Endpoint: `https://yourdomain.com/api/payments/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. **Test with Stripe test mode** before going live

### Blockradar Setup

1. **Create a Blockradar account** at [blockradar.com](https://blockradar.com)
2. **Get your API key** from the dashboard
3. **Create a wallet** for stablecoin management
4. **Configure supported tokens**: USDC, USDT, DAI

### Payment Flow Configuration

The platform supports two types of payment links:

- **Product Links**: For specific products with fixed pricing
- **General Payment Links**: For flexible amounts and custom payments

## 📱 Usage

### For Merchants

1. **Create Account**: Sign up with email or social login
2. **Generate Payment Links**: Create product or general payment links
3. **Share Links**: Distribute payment URLs to customers
4. **Accept Payments**: Customers pay with cards via Stripe
5. **Receive Stablecoins**: Automatic conversion to USDC/USDT
6. **Track Analytics**: Monitor payments and stablecoin balances

### For Customers

1. **Click Payment Link**: Access shared payment URLs
2. **Enter Payment Details**: Use any card (Visa, Mastercard, etc.)
3. **Complete Payment**: Secure processing via Stripe
4. **Confirmation**: Receive payment confirmation
5. **Merchant Receives**: Stablecoins automatically sent to merchant

## 🔌 API Endpoints

The application uses an external backend API (configured via `NEXT_PUBLIC_API_URL`).

### Payment Endpoints

**Protected:**

- `GET /protected/payment/earnings` - Get earnings by status
- `GET /protected/payment/sales-heatmap` - Get sales heatmap (365 days)
- `GET /protected/payment/transactions` - Get transaction history

**Public:**

- `POST /public/payment/intent` - Create payment intent
- `POST /public/payment/intent/cancel` - Cancel payment intent
- `POST /public/payment/intent/verify-microdeposits` - Verify microdeposits
- `POST /public/payment/intent/sync` - Sync payment intent

### Product Endpoints

**Protected:**

- `POST /protected/product` - Create product
- `GET /protected/product` - Get all products (paginated)
- `PUT /protected/product/{productId}` - Update product
- `GET /protected/product/stats` - Get product statistics
- `GET /protected/product/{productId}/payment-counts` - Get payment counts
- `GET /protected/product/{productId}/payment-amounts` - Get payment amounts

**Public:**

- `GET /public/p/{uniqueName}/{slug}` - Get product by payment link

### Wallet Endpoints

**Protected:**

- `GET /protected/wallet/balance` - Get wallet balance
- `GET /protected/wallet/payouttransactions/{chain}` - Get payout transactions
- `POST /protected/wallet/withdraw/single` - Single asset withdrawal
- `POST /protected/wallet/withdraw/batch` - Batch asset withdrawal

### Unique Name Endpoints

**Protected:**

- `GET /protected/unique-name` - Get user's unique name
- `POST /protected/unique-name/set` - Set/update unique name
- `GET /protected/unique-name/check/{uniqueName}` - Check availability

### Webhooks (Local)

- `POST /api/webhooks/stripe` - Stripe webhook handler
- `POST /api/webhooks/clerk` - Clerk webhook handler
- `POST /api/webhooks/blockradar` - Blockradar webhook handler

## 🎨 Theming

The platform uses a modern **Stablestack** theme with:

- **Primary Color**: `#3b82f6` (Blue)
- **Background**: Clean gradients and solid colors
- **Typography**: Modern sans-serif fonts
- **Components**: Professional, clean aesthetic

### Customization

Modify theme variables in:

- `app/globals.css` - Global styles and CSS variables
- `components/ui/` - Component styling
- `lib/stripe.ts` - Stripe theming

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** automatically on push

### Manual Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🔒 Security

- **Stripe Security**: PCI-compliant payment processing
- **Webhook Verification**: Secure Stripe webhook validation
- **API Key Protection**: Secure storage of sensitive keys
- **Input Validation**: Comprehensive input sanitization
- **HTTPS Only**: Secure communication protocols

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests** (if applicable)
5. **Submit a pull request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🙏 Acknowledgments

- **Stripe** - Payment processing infrastructure
- **Blockradar** - Stablecoin wallet management
- **Next.js** - React framework
- **Tailwind CSS** - Styling framework
- **Radix UI** - Component primitives

---

**Built with ❤️ for the payment community**

_Stablestack - Where traditional payments meet crypto_
