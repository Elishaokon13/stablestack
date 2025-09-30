# Stable- Web3 Payments Platform

> **The ultimate rebel payment platform for Web3. Accept USDC payments with style.**

A modern, full-stack Web3 payment platform built with Next.js 15, React 19, and Reown (formerly WalletConnect) that enables seamless USDC payments on the Base network with embedded wallet support.

## 🚀 Features

### 🔐 **Authentication & Wallets**
- **Embedded Wallets**: Email and social login with automatic wallet creation
- **Social Authentication**: Google, X/Twitter, GitHub integration
- **Email Magic Links**: Secure OTP-free authentication
- **Reown AppKit**: Modern wallet connection experience
- **Base Network**: Optimized for USDC payments

### 💰 **Payment System**
- **USDC Payments**: Accept payments in USD Coin on Base
- **Product Management**: Create, manage, and track products
- **Payment Links**: Shareable payment URLs for products
- **Real-time Analytics**: Track sales, earnings, and performance
- **Blockchain Verification**: Automatic transaction verification

### 🎨 **User Experience**
- **M.O.N.K.Y OS Theme**: Cyberpunk/rebel aesthetic design
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

### **Web3 & Blockchain**
- **Reown AppKit 1.8.8** - Wallet connection and management
- **Wagmi 2.17.5** - React hooks for Ethereum
- **Ethers.js 6.15.0** - Ethereum library
- **Base Network** - Layer 2 for USDC payments

### **Backend & Database**
- **MongoDB 6.20.0** - NoSQL database
- **Mongoose 8.18.3** - MongoDB object modeling
- **NextAuth.js 4.24.11** - Authentication
- **Zod 3.25.67** - Schema validation

### **Development Tools**
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Vercel Analytics** - Performance monitoring

## 📁 Project Structure

```
stablestack/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── analytics/            # Analytics endpoints
│   │   ├── auth/                 # Authentication
│   │   ├── payments/             # Payment processing
│   │   ├── products/             # Product management
│   │   ├── users/                # User management
│   │   └── verify-payment/       # Payment verification
│   ├── dashboard/                # Seller dashboard
│   ├── pay/[slug]/               # Payment pages
│   ├── products/                 # Product management
│   ├── payments/                 # Payment history
│   ├── analytics/                # Analytics dashboard
│   └── test-wallet/              # Wallet testing
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   │   ├── AppKitButton.tsx      # Reown AppKit button
│   │   ├── Wallet.tsx            # Wallet management
│   │   └── WalletStatus.tsx      # Wallet status display
│   ├── cards/                    # Card components
│   │   └── Product.tsx           # Product cards
│   ├── forms/                    # Form components
│   │   ├── Onboarding.tsx        # User onboarding
│   │   ├── Payment.tsx           # Payment forms
│   │   └── Product.tsx           # Product forms
│   ├── dashboard/                # Dashboard components
│   │   ├── layout/               # Dashboard layout
│   │   └── sidebar/              # Navigation sidebar
│   └── ui/                       # Base UI components
├── lib/                          # Utility libraries
│   ├── models/                   # Database models
│   │   ├── User.ts               # User schema
│   │   ├── Product.ts            # Product schema
│   │   └── Payment.ts            # Payment schema
│   ├── types/                    # TypeScript types
│   ├── appkit-config.ts          # Reown configuration
│   ├── database.ts               # MongoDB connection
│   └── blockchain-verification.ts # Payment verification
├── hooks/                        # Custom React hooks
│   └── useUserSession.ts         # User session management
└── public/                       # Static assets
    ├── fonts/                    # Custom fonts
    ├── avatars/                  # User avatars
    └── assets/                   # Images and icons
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **MongoDB** (local or cloud)
- **Reown Project ID** (from [dashboard.reown.com](https://dashboard.reown.com))

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
   # Required
   NEXT_PUBLIC_PROJECT_ID=your_reown_project_id
   MONGODB_URI=mongodb://localhost:27017/stablestack
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # Optional
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ALCHEMY_API_KEY=your_alchemy_api_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Reown AppKit Setup

1. **Create a Reown project** at [dashboard.reown.com](https://dashboard.reown.com)
2. **Get your Project ID** from the dashboard
3. **Configure authentication methods**:
   - Enable Email authentication
   - Enable Social logins (Google, X, GitHub)
   - Disable Reown authentication (for embedded wallets)

### Database Setup

The application uses MongoDB with the following collections:

- **Users**: Store user profiles and wallet addresses
- **Products**: Manage seller products and pricing
- **Payments**: Track payment transactions and status

### Network Configuration

The platform is configured for **Base Network**:
- **Mainnet**: `0x2105` (Base)
- **Testnet**: `0x14a34` (Base Sepolia)

## 📱 Usage

### For Sellers

1. **Connect Wallet**: Use email or social login
2. **Complete Onboarding**: Set up your profile
3. **Create Products**: Add products with USDC pricing
4. **Share Payment Links**: Generate shareable payment URLs
5. **Track Analytics**: Monitor sales and earnings

### For Buyers

1. **Connect Wallet**: Use email or social login
2. **Browse Products**: View available products
3. **Make Payments**: Pay with USDC on Base network
4. **Track Transactions**: View payment history

## 🔌 API Endpoints

### Authentication
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user

### Users
- `GET /api/users?walletAddress=...` - Get user by wallet
- `POST /api/users` - Create new user
- `PUT /api/users?walletAddress=...` - Update user

### Products
- `GET /api/products?sellerId=...` - Get seller products
- `GET /api/products?paymentLink=...` - Get product by payment link
- `POST /api/products` - Create new product
- `PUT /api/products?productId=...` - Update product

### Payments
- `GET /api/payments?sellerId=...` - Get seller payments
- `POST /api/payments` - Create payment
- `PUT /api/payments?paymentId=...` - Update payment status

### Analytics
- `GET /api/analytics?sellerId=...` - Get seller analytics

## 🎨 Theming

The platform uses a custom **M.O.N.K.Y OS** theme with:

- **Primary Color**: `#ff5941` (Orange)
- **Background**: Dark gradient (`#1a1a1a` to `#2d2d2d`)
- **Typography**: Custom "Rebels-Fett" font
- **Components**: Cyberpunk/rebel aesthetic

### Customization

Modify theme variables in:
- `app/globals.css` - Global styles
- `lib/appkit-config.ts` - Reown theming
- `components/ui/` - Component styling

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

- **Embedded Wallets**: Non-custodial wallet creation
- **Magic Links**: Secure email authentication
- **Blockchain Verification**: Automatic transaction verification
- **Input Validation**: Zod schema validation
- **CORS Protection**: API endpoint security

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

- **Reown** - Wallet connection infrastructure
- **Base Network** - Layer 2 blockchain
- **Next.js** - React framework
- **Tailwind CSS** - Styling framework
- **Radix UI** - Component primitives

---

**Built with ❤️ for the Web3 community**

*M.O.N.K.Y OS - Where rebels meet payments*