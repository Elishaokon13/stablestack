# Stripe + Blockradar Integration

This project demonstrates a complete integration between Stripe (for fiat payments) and Blockradar (for crypto disbursements), creating a seamless payment and payout system.

## 🏗️ Architecture

### Components
- **Stripe**: Handles global card and fiat payment processing
- **Blockradar**: Manages stablecoin/crypto custody and facilitates instant crypto payouts
- **Next.js App**: Frontend and API integration layer

### Key Features
- ✅ Stripe Payment Intents API integration
- ✅ Blockradar Wallets API integration  
- ✅ Blockradar Transactions API integration
- ✅ Webhook handling for both services
- ✅ Complete payment flow demonstration
- ✅ Wallet dashboard
- ✅ Transaction monitoring

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template and fill in your API keys:

```bash
cp config/env.example .env.local
```

Required environment variables:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Blockradar Configuration
BLOCKRADAR_API_KEY=your_blockradar_api_key_here
BLOCKRADAR_API_URL=https://api.blockradar.co
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Access the Demo

Visit `http://localhost:3000/payment-flow` to see the complete integration in action.

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── payments/
│   │   │   ├── create-intent/route.ts    # Create Stripe payment intent
│   │   │   └── webhook/route.ts          # Handle Stripe webhooks
│   │   ├── wallets/
│   │   │   ├── create/route.ts          # Create Blockradar wallet
│   │   │   └── balance/route.ts         # Get wallet balance
│   │   └── payouts/
│   │       ├── initiate/route.ts        # Initiate crypto payout
│   │       └── status/route.ts          # Check payout status
│   └── payment-flow/page.tsx            # Demo page
├── components/
│   ├── payment/
│   │   └── payment-form.tsx             # Stripe payment form
│   └── wallet/
│       └── wallet-dashboard.tsx        # Wallet management UI
├── lib/
│   ├── stripe.ts                       # Stripe API client
│   └── blockradar.ts                   # Blockradar API client
└── scratchpad.md                       # Detailed integration plan
```

## 🔄 Payment Flow

### 1. Payment Processing (Stripe)
- User enters payment amount
- Stripe Payment Intents API creates payment intent
- Card payment processing with 3DS authentication
- Webhook confirms payment success

### 2. Crypto Payout Preparation (Blockradar)
- Create user wallet if doesn't exist
- Generate dedicated address for user
- Monitor wallet balance and liquidity

### 3. Crypto Disbursement (Blockradar)
- Calculate payout amount (1:1 with fiat payment)
- Create Blockradar transaction
- Sign and broadcast on-chain
- Monitor transaction status

### 4. Reconciliation
- Match Stripe fiat inflows with Blockradar crypto outflows
- Generate reconciliation reports
- Maintain audit trails

## 🛠️ API Endpoints

### Stripe Integration
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Handle Stripe webhooks

### Blockradar Integration
- `POST /api/wallets/create` - Create user wallet
- `GET /api/wallets/balance` - Get wallet balance
- `POST /api/payouts/initiate` - Start crypto payout
- `GET /api/payouts/status` - Check payout status

## 🎯 Key Features

### Stripe Features
- Payment Intents API for secure payments
- Webhook handling for real-time updates
- 3DS authentication support
- Multiple payment methods
- PCI compliance through Stripe Elements

### Blockradar Features
- Wallet creation and management
- Address generation for users
- Transaction creation and monitoring
- Balance tracking
- Multi-currency support (USDC, USDT, etc.)

### Integration Features
- Seamless fiat-to-crypto flow
- Real-time status updates
- Error handling and retry logic
- Comprehensive logging
- Audit trail maintenance

## 🔐 Security Considerations

### API Security
- Environment variables for API keys
- Webhook signature verification
- Rate limiting on API endpoints
- Input validation and sanitization

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement proper authentication
- Regular security audits

### Compliance
- Transaction monitoring
- KYC/AML data integration
- Regulatory reporting
- Audit trail maintenance

## 📊 Monitoring & Analytics

### Key Metrics
- Payment success rate
- Payout success rate
- Average processing time
- Error rates and types

### Dashboard Features
- Real-time transaction monitoring
- Wallet balance tracking
- Transaction history
- Performance analytics

## 🧪 Testing

### Test Cards (Stripe)
- Success: `4242424242424242`
- Requires 3DS: `4000002500003155`
- Declined: `4000000000000002`

### Test Environment
- Use Stripe test mode
- Use Blockradar sandbox
- Test webhook endpoints
- Verify transaction flows

## 🚀 Deployment

### Development
1. Use test API keys
2. Enable webhook testing
3. Use local database
4. Implement comprehensive logging

### Production
1. Use live API keys
2. Configure production webhooks
3. Set up monitoring and alerting
4. Implement backup and recovery

## 📚 Documentation Links

### Stripe
- [Payment Intents API](https://stripe.com/docs/api/payment_intents)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Checkout](https://stripe.com/docs/checkout)

### Blockradar
- [Wallets API](https://docs.blockradar.co/wallets)
- [Transactions API](https://docs.blockradar.co/transactions)
- [Webhooks](https://docs.blockradar.co/webhooks)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues:
1. Check the documentation
2. Review the scratchpad.md file
3. Open an issue on GitHub
4. Contact the development team

---

**Note**: This is a demonstration project. For production use, ensure proper security measures, compliance requirements, and thorough testing are implemented.
