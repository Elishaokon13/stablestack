# API Integration Guide

This document describes the API integration with the backend service (configured via `NEXT_PUBLIC_API_URL`).

## Architecture Overview

The codebase follows a clean, modular architecture with clear separation of concerns:

```
lib/
├── api/
│   └── client.ts          # Base API client with authentication
├── hooks/
│   ├── payment/           # Payment-related hooks
│   │   ├── use-earnings.ts
│   │   ├── use-sales-heatmap.ts
│   │   ├── use-transactions.ts
│   │   ├── use-payment-intent.ts
│   │   └── index.ts
│   ├── product/           # Product-related hooks
│   │   ├── use-products.ts
│   │   ├── use-create-product.ts
│   │   ├── use-update-product.ts
│   │   ├── use-product-stats.ts
│   │   ├── use-product-analytics.ts
│   │   ├── use-public-product.ts
│   │   └── index.ts
│   ├── wallet/            # Wallet-related hooks
│   │   ├── use-wallet-balance.ts
│   │   ├── use-payout-transactions.ts
│   │   ├── use-withdraw.ts
│   │   └── index.ts
│   └── unique-name/       # Unique name hooks
│       ├── use-unique-name.ts
│       ├── use-check-unique-name.ts
│       └── index.ts
```

## API Client

### Base Client (`lib/api/client.ts`)

The base API client handles:

- ✅ Authentication via Clerk bearer tokens
- ✅ Error handling with custom `ApiError` class
- ✅ Type-safe request/response handling
- ✅ Automatic JSON serialization

### Usage

```typescript
import { apiClient } from "@/lib/api/client";

// GET request
const data = await apiClient.get<ResponseType>("/endpoint", token);

// POST request
const result = await apiClient.post<ResponseType>("/endpoint", { data }, token);

// PUT request
const updated = await apiClient.put<ResponseType>("/endpoint", { data }, token);

// DELETE request
await apiClient.delete("/endpoint", token);
```

## Hook Design Principles

Following best practices from [Teach Yourself CS](https://teachyourselfcs.com/):

1. **Single Responsibility** - Each hook handles one specific concern
2. **Separation of Concerns** - Hooks are organized by domain (payment, product, wallet)
3. **Type Safety** - Full TypeScript type definitions
4. **Error Handling** - Comprehensive error handling in each hook
5. **Reusability** - Hooks can be composed and reused across components

## Payment Hooks

### `useEarnings()`

Fetches payment earnings by status.

```typescript
import { useEarnings } from "@/lib/hooks/payment";

const { earnings, loading, error, refetch } = useEarnings();

// earnings: { total, completed, pending, failed }
```

### `useSalesHeatmap()`

Fetches sales activity for the last 365 days.

```typescript
import { useSalesHeatmap } from "@/lib/hooks/payment";

const { heatmapData, loading, error, refetch } = useSalesHeatmap();

// heatmapData: Array<{ date: string, count: number, amount: number }>
```

### `useTransactions(options?)`

Fetches paginated transaction history.

```typescript
import { useTransactions } from "@/lib/hooks/payment";

const { transactions, total, loading, error, refetch, fetchPage } =
  useTransactions({
    page: 1,
    limit: 10,
    autoFetch: true,
  });
```

### `usePaymentIntent()`

Handles payment intent operations.

```typescript
import { usePaymentIntent } from "@/lib/hooks/payment";

const {
  loading,
  error,
  paymentIntent,
  createIntent,
  cancelIntent,
  verifyMicrodeposits,
  syncIntent,
} = usePaymentIntent();

// Create payment intent with full payment link
const intent = await createIntent("https://goopenly.xyz/username/product-slug");

// Response includes:
// {
//   paymentIntentId: "pi_3SGorBFrYnvWLTxO1EmYopf8",
//   clientSecret: "pi_..._secret_...",
//   productId: "pr7tnlx4c",
//   amount: 29.99,
//   currency: "usd",
//   status: "INITIATED",
//   paymentLink: "https://goopenly.xyz/dayo/premium-subscription"
// }

// Use clientSecret for Stripe payment
const { clientSecret, amount } = intent;

// Cancel intent
const success = await cancelIntent("pi_3SGorBFrYnvWLTxO1EmYopf8");

// Verify microdeposits
const verified = await verifyMicrodeposits("pi_...", [32, 45]);

// Sync intent from Stripe
const synced = await syncIntent("pi_3SGorBFrYnvWLTxO1EmYopf8");
```

## Product Hooks

### `useProducts(options?)`

Fetches products with pagination.

```typescript
import { useProducts } from "@/lib/hooks/product";

const { products, total, loading, error, refetch, fetchPage } = useProducts({
  page: 1,
  limit: 10,
});
```

### `useCreateProduct()`

Creates a new product.

```typescript
import { useCreateProduct } from "@/lib/hooks/product";

const { loading, error, createProduct } = useCreateProduct();

const product = await createProduct({
  name: "Premium Plan",
  description: "Description",
  priceUSD: 99.99,
  imageUrl: "https://...",
  category: "subscription",
});
```

### `useUpdateProduct()`

Updates an existing product.

```typescript
import { useUpdateProduct } from "@/lib/hooks/product";

const { loading, error, updateProduct } = useUpdateProduct();

const updated = await updateProduct("product-id", {
  name: "Updated Name",
  priceUSD: 149.99,
});
```

### `useProductStats()`

Fetches product statistics.

```typescript
import { useProductStats } from "@/lib/hooks/product";

const { stats, loading, error, refetch } = useProductStats();

// stats: { totalProducts, activeProducts, totalRevenue, totalOrders }
```

### `useProductAnalytics(productId)`

Fetches analytics for a specific product.

```typescript
import { useProductAnalytics } from "@/lib/hooks/product";

const { counts, amounts, loading, error, refetch } =
  useProductAnalytics("product-id");

// counts: { total, completed, pending, failed }
// amounts: { total, completed, pending }
```

### `usePublicProduct(options)`

Fetches public product by unique name and slug.

```typescript
import { usePublicProduct } from "@/lib/hooks/product";

const { product, loading, error, refetch } = usePublicProduct({
  uniqueName: "johndoe",
  slug: "premium-plan",
});
```

## Wallet Hooks

### `useWalletBalance()`

Fetches wallet balance.

```typescript
import { useWalletBalance } from "@/lib/hooks/wallet";

const { balance, loading, error, refetch } = useWalletBalance();

// balance: { address, balances: { [token]: { balance, decimals, symbol } } }
```

### `usePayoutTransactions(chain)`

Fetches payout transactions for a specific chain.

```typescript
import { usePayoutTransactions } from "@/lib/hooks/wallet";

const { transactions, loading, error, refetch } =
  usePayoutTransactions("ethereum");
```

### `useWithdraw()`

Handles wallet withdrawals.

```typescript
import { useWithdraw } from "@/lib/hooks/wallet";

const { loading, error, withdrawSingle, withdrawBatch } = useWithdraw();

// Single withdrawal
const result = await withdrawSingle({
  token: "USDC",
  amount: "100.50",
  toAddress: "0x...",
});

// Batch withdrawal
const batchResult = await withdrawBatch({
  withdrawals: [
    { token: "USDC", amount: "50", toAddress: "0x..." },
    { token: "ETH", amount: "0.1", toAddress: "0x..." },
  ],
});
```

## Unique Name Hooks

### `useUniqueName()`

Fetches and sets user's unique name. When setting a unique name, multi-chain wallets are automatically generated.

```typescript
import { useUniqueName } from "@/lib/hooks/unique-name";

const { uniqueName, loading, error, walletsGenerated, refetch, setUniqueName } =
  useUniqueName();

// Set unique name
const result = await setUniqueName("dayo");

if (result) {
  console.log("Unique name:", result.uniqueName); // "dayo"
  console.log("Is update:", result.isUpdate); // false (first time)
  console.log("Wallets generated:", result.walletsGenerated); // true
}

// Response format:
// {
//   uniqueName: "dayo",
//   isUpdate: false,
//   walletsGenerated: true
// }
```

### Important Notes

- Setting a unique name **automatically generates multi-chain wallets**
- Unique names are used in payment links: `https://goopenly.xyz/{uniqueName}/{slug}`
- Once set, you can update it (isUpdate will be true)
- Wallets are generated on first setup only

### `useCheckUniqueName()`

Checks if a unique name is available.

```typescript
import { useCheckUniqueName } from "@/lib/hooks/unique-name";

const { loading, error, checkAvailability } = useCheckUniqueName();

const available = await checkAvailability("johndoe");
```

## Authentication

All protected endpoints require Clerk authentication. The hooks automatically:

1. Get the auth token using Clerk's `getToken()`
2. Pass it as a Bearer token in the Authorization header
3. Handle auth errors gracefully

### Example

```typescript
// Inside a hook
const { getToken } = useAuth();
const token = await getToken();

const data = await apiClient.get("/protected/endpoint", token);
```

## Error Handling

All hooks follow a consistent error handling pattern:

```typescript
const { data, loading, error } = useHook();

if (loading) return <Loading />;
if (error) return <Error message={error} />;
return <Component data={data} />;
```

### Custom Error Class

```typescript
class ApiError extends Error {
  constructor(message: string, public status: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}
```

## Environment Variables

Required environment variable:

```env
NEXT_PUBLIC_API_URL=
```

## Best Practices

1. **Use hooks in components** - Never call API client directly in components
2. **Handle loading states** - Always show loading indicators
3. **Handle errors gracefully** - Display user-friendly error messages
4. **Refetch when needed** - Use the `refetch` function after mutations
5. **Type everything** - Use TypeScript interfaces for all data structures

## Migration from Old API

The old `/app/api` routes have been removed. Instead:

- ✅ Use dedicated hooks for each API operation
- ✅ All data fetching happens through the external API
- ✅ Webhooks remain in `/app/api/webhooks` (called by external services)

## Example Component Integration

```typescript
"use client";

import { useProductStats } from "@/lib/hooks/product";
import { useTransactions } from "@/lib/hooks/payment";

export default function Dashboard() {
  const { stats, loading: statsLoading } = useProductStats();
  const { transactions, loading: txLoading } = useTransactions({ limit: 5 });

  if (statsLoading || txLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1>Revenue: ${stats?.totalRevenue || 0}</h1>
      <TransactionsList transactions={transactions} />
    </div>
  );
}
```

## Testing

When testing components that use these hooks:

1. Mock the hooks in your tests
2. Test loading states
3. Test error states
4. Test successful data fetching

```typescript
jest.mock("@/lib/hooks/payment", () => ({
  useTransactions: () => ({
    transactions: mockTransactions,
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));
```

## Future Improvements

- [ ] Add React Query for caching and optimistic updates
- [ ] Implement retry logic for failed requests
- [ ] Add request debouncing for search/filter operations
- [ ] Implement WebSocket support for real-time updates
- [ ] Add comprehensive error tracking

---

**Following standards from:** [Teach Yourself CS](https://teachyourselfcs.com/)

- Clean code principles
- Separation of concerns
- Type safety
- Error handling
- Documentation
