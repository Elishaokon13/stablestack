# Payment Flow Example

## Complete Payment Flow with New API

This guide shows how to implement the complete payment flow using the new backend API.

## 🔄 Payment Flow Overview

```
1. Create Product → 2. Generate Payment Link → 3. Create Payment Intent → 4. Process Payment → 5. Receive Payout
```

## 📝 Step-by-Step Implementation

### Step 1: Create Product

```typescript
import { useCreateProduct } from "@/lib/hooks/product";

const { createProduct, loading } = useCreateProduct();

const product = await createProduct({
  productName: "Premium Subscription",
  description: "Monthly premium subscription with advanced features",
  amount: "29.99",
  payoutChain: "base-sepolia", // or "base" for mainnet
  payoutToken: "USDC",
  slug: "premium-subscription",
  linkExpiration: "custom_days",
  customDays: 30,
  image: imageFile, // Optional
});

// Response:
// {
//   id: "pr7tnlx4c",
//   productName: "Premium Subscription",
//   paymentLink: "https://goopenly.xyz/dayo/premium-subscription",
//   amount: "29.99",
//   status: "active",
//   expiresAt: "2025-11-09T22:31:16.449Z",
//   ...
// }
```

### Step 2: Share Payment Link

The `paymentLink` from the product is ready to share:

```typescript
const paymentUrl = product.paymentLink;
// https://goopenly.xyz/dayo/premium-subscription

// Share via:
// - Email
// - Social media
// - QR code
// - Direct link
```

### Step 3: Customer Visits Payment Link

When a customer clicks the link, create a payment intent:

```typescript
import { usePaymentIntent } from "@/lib/hooks/payment";

const { createIntent, paymentIntent } = usePaymentIntent();

// On payment page load
useEffect(() => {
  const initializePayment = async () => {
    const intent = await createIntent(paymentLink);

    if (intent) {
      // Intent created successfully
      console.log("Payment Intent ID:", intent.paymentIntentId);
      console.log("Client Secret:", intent.clientSecret);
      console.log("Amount:", intent.amount);
    }
  };

  initializePayment();
}, [paymentLink]);
```

**Response:**

```json
{
  "paymentIntentId": "pi_3SGorBFrYnvWLTxO1EmYopf8",
  "clientSecret": "pi_..._secret_...",
  "productId": "pr7tnlx4c",
  "amount": 29.99,
  "currency": "usd",
  "status": "INITIATED",
  "paymentLink": "https://goopenly.xyz/dayo/premium-subscription"
}
```

### Step 4: Process Payment with Stripe

Use the `clientSecret` to process payment:

```typescript
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function PaymentPage() {
  const { paymentIntent } = usePaymentIntent();

  if (!paymentIntent) return <Loading />;

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret: paymentIntent.clientSecret }}
    >
      <CheckoutForm
        amount={paymentIntent.amount}
        productId={paymentIntent.productId}
      />
    </Elements>
  );
}

function CheckoutForm({ amount, productId }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (error) {
      console.error("Payment failed:", error);
    } else if (paymentIntent.status === "succeeded") {
      console.log("Payment successful!");
      // Webhook will trigger payout automatically
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit">Pay ${amount}</button>
    </form>
  );
}
```

### Step 5: Automatic Payout

After successful payment:

1. ✅ Stripe webhook fires → Backend receives notification
2. ✅ Backend initiates payout in USDC
3. ✅ Merchant receives crypto on selected chain (Base or Base Sepolia)
4. ✅ Transaction appears in wallet dashboard

## 📊 Complete Example Component

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { usePublicProduct } from "@/lib/hooks/product";
import { usePaymentIntent } from "@/lib/hooks/payment";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function PaymentPage() {
  const params = useParams();
  const uniqueName = params.uniqueName as string;
  const slug = params.slug as string;

  const { product, loading: productLoading } = usePublicProduct({
    uniqueName,
    slug,
  });
  const {
    createIntent,
    paymentIntent,
    loading: intentLoading,
  } = usePaymentIntent();

  useEffect(() => {
    if (product && !paymentIntent) {
      // Create payment intent when product loads
      createIntent(product.paymentLink);
    }
  }, [product]);

  if (productLoading || intentLoading) {
    return <LoadingSpinner />;
  }

  if (!product || !paymentIntent) {
    return <ErrorMessage />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Product Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{product.productName}</h1>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <p className="text-2xl font-bold mt-4">${product.amount}</p>
      </div>

      {/* Payment Form */}
      <Elements
        stripe={stripePromise}
        options={{ clientSecret: paymentIntent.clientSecret }}
      >
        <CheckoutForm
          amount={paymentIntent.amount}
          productName={product.productName}
        />
      </Elements>
    </div>
  );
}

function CheckoutForm({ amount, productName }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (error) {
      console.error(error);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg"
      >
        {processing ? "Processing..." : `Pay $${amount}`}
      </button>
    </form>
  );
}
```

## 🎯 Key Points

### Product Response Structure

```json
{
  "ok": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "id": "pr7tnlx4c",
      "productName": "Premium Subscription",
      "paymentLink": "https://goopenly.xyz/dayo/premium-subscription",
      "amount": "29.99",
      "status": "active",
      "expiresAt": "2025-11-09T22:31:16.449Z"
    }
  }
}
```

### Payment Intent Response Structure

```json
{
  "ok": true,
  "message": "Payment intent created successfully",
  "data": {
    "paymentIntentId": "pi_3SGorBFrYnvWLTxO1EmYopf8",
    "clientSecret": "pi_..._secret_...",
    "productId": "pr7tnlx4c",
    "amount": 29.99,
    "status": "INITIATED"
  }
}
```

## 🔐 Security Flow

1. **Product Creation** - Protected endpoint (requires auth)
2. **Payment Link** - Public, shareable URL
3. **Payment Intent** - Public endpoint (no auth required)
4. **Payment Processing** - Handled by Stripe
5. **Webhook** - Verifies payment and triggers payout
6. **Payout** - Automatic USDC transfer to merchant

## 💰 Payout Details

- **Chain**: Base or Base Sepolia (testnet)
- **Token**: USDC only
- **Automatic**: Triggered after successful payment
- **Fast**: Usually processes within minutes

## 📱 Mobile Responsive

The payment flow works seamlessly on:

- ✅ Desktop browsers
- ✅ Mobile browsers
- ✅ In-app browsers (Instagram, Facebook, etc.)
- ✅ Apple Pay / Google Pay

## 🧪 Testing

### Test on Base Sepolia

1. Create product with `payoutChain: "base-sepolia"`
2. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
3. Check payout on Base Sepolia testnet

### Production on Base

1. Create product with `payoutChain: "base"`
2. Use real payment methods
3. Receive USDC on Base mainnet

## 🎨 Customization

Customize the payment page by:

- Adding product images
- Custom branding
- Additional product info
- Testimonials
- Trust badges

## 📊 Tracking

Monitor payments via:

- `useTransactions()` - Transaction history
- `useEarnings()` - Revenue tracking
- `useSalesHeatmap()` - Activity visualization
- `useProductAnalytics()` - Product performance

---

**Ready to accept payments!** 🚀
