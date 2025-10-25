## Quick Start Guide

Get up and running with Openly in 5 minutes.

## Prerequisites

- Node.js 18+
- Git
- Clerk account ([clerk.com](https://clerk.com))

## Setup Steps

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd openly
npm install
```

### 2. Environment Setup

```bash
cp config/env.example .env.local
```

Edit `.env.local` with your values:

```env
# Backend API
NEXT_PUBLIC_API_URL=

# Clerk Auth (Get from clerk.com dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Architecture

### Clean Separation of Concerns

```
Frontend (Next.js)  →  Hooks  →  API Client  →  Backend API
                         ↓
                    State Management
```

### No "God Hooks"

Each hook has a single, clear responsibility:

```typescript
// ✅ Good - Single responsibility
useEarnings(); // Fetches earnings only
useTransactions(); // Fetches transactions only
useProducts(); // Fetches products only

// ❌ Bad - Too many responsibilities
useEverything(); // Does too much
```

### Domain Organization

```
lib/hooks/
├── payment/       # Payment domain
├── product/       # Product domain
├── wallet/        # Wallet domain
└── unique-name/   # Identity domain
```

## Using the Hooks

### In a Component

```typescript
"use client";

import { useEarnings } from "@/lib/hooks/payment";

export default function EarningsCard() {
  const { earnings, loading, error } = useEarnings();

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return <div>Total: ${earnings?.total}</div>;
}
```

### Multiple Hooks

```typescript
import { useEarnings, useTransactions } from "@/lib/hooks/payment";
import { useProductStats } from "@/lib/hooks/product";

function Dashboard() {
  const { earnings } = useEarnings();
  const { transactions } = useTransactions({ limit: 5 });
  const { stats } = useProductStats();

  return (
    <div>
      <Stats earnings={earnings} stats={stats} />
      <TransactionList transactions={transactions} />
    </div>
  );
}
```

## Authentication

All hooks automatically handle Clerk authentication:

```typescript
// Inside hook
const { getToken } = useAuth();
const token = await getToken();

// Token is passed to API automatically
const data = await apiClient.get("/protected/endpoint", token);
```

## Error Handling

All hooks follow consistent error handling:

```typescript
const { data, loading, error, refetch } = useHook();

// Always handle these three states
if (loading) return <LoadingState />;
if (error) return <ErrorState message={error} />;
return <SuccessState data={data} />;
```

## Available Endpoints

### Payment Operations

```typescript
// Get earnings
const { earnings } = useEarnings();

// Get sales heatmap
const { heatmapData } = useSalesHeatmap();

// Get transactions
const { transactions } = useTransactions({ page: 1, limit: 10 });

// Create payment intent
const { createIntent } = usePaymentIntent();
const intent = await createIntent("payment-link");
```

### Product Operations

```typescript
// List products
const { products } = useProducts({ page: 1, limit: 10 });

// Create product
const { createProduct } = useCreateProduct();
const product = await createProduct({
  name: "Product Name",
  priceUSD: 99.99,
});

// Update product
const { updateProduct } = useUpdateProduct();
const updated = await updateProduct("product-id", { priceUSD: 149.99 });

// Get stats
const { stats } = useProductStats();
```

### Wallet Operations

```typescript
// Get balance
const { balance } = useWalletBalance();

// Get transactions
const { transactions } = usePayoutTransactions("ethereum");

// Withdraw funds
const { withdrawSingle } = useWithdraw();
await withdrawSingle({
  token: "USDC",
  amount: "100",
  toAddress: "0x...",
});
```

## Best Practices

### 1. Always Handle Loading States

```typescript
if (loading) {
  return <Skeleton />; // Or spinner
}
```

### 2. Always Handle Errors

```typescript
if (error) {
  return <Alert variant="destructive">{error}</Alert>;
}
```

### 3. Use Refetch After Mutations

```typescript
const { refetch } = useProducts();
const { createProduct } = useCreateProduct();

const handleCreate = async (data) => {
  await createProduct(data);
  refetch(); // Refresh the list
};
```

### 4. Optimize with Options

```typescript
// Don't auto-fetch if not needed
const { products, refetch } = useProducts({ autoFetch: false });

// Fetch manually when ready
useEffect(() => {
  if (someCondition) {
    refetch();
  }
}, [someCondition]);
```

## Common Patterns

### Master-Detail

```typescript
function ProductList() {
  const { products } = useProducts();
  const [selectedId, setSelectedId] = useState(null);

  return (
    <>
      <List products={products} onSelect={setSelectedId} />
      {selectedId && <ProductDetail id={selectedId} />}
    </>
  );
}

function ProductDetail({ id }) {
  const { counts, amounts } = useProductAnalytics(id);
  // Show detailed analytics
}
```

### Pagination

```typescript
const { products, total, fetchPage } = useProducts({ page: 1, limit: 10 });

return (
  <>
    <ProductList products={products} />
    <Pagination total={total} onPageChange={fetchPage} />
  </>
);
```

### Create-Refresh Pattern

```typescript
const { products, refetch } = useProducts();
const { createProduct } = useCreateProduct();

const handleSubmit = async (data) => {
  const result = await createProduct(data);
  if (result) {
    refetch(); // Refresh list
    onClose(); // Close modal
  }
};
```

## Troubleshooting

### "Authentication required" error

Make sure:

1. User is logged in
2. Clerk is properly configured
3. `getToken()` is available

### "Failed to fetch" error

Check:

1. API URL in `.env.local`
2. Network connection
3. Backend API is running

### TypeScript errors

Run:

```bash
npm run lint
```

Fix any type errors before proceeding.

## Next Steps

1. Read [API_INTEGRATION.md](./API_INTEGRATION.md) for detailed API docs
2. Read [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) for architecture details
3. Explore hooks in `lib/hooks/` directory
4. Check components in `components/` for usage examples

## Resources

- [Teach Yourself CS](https://teachyourselfcs.com/) - Software engineering principles
- [Next.js Docs](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react)
- [Clerk Docs](https://clerk.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Need Help?**

- Check the docs in `/docs` directory
- Review example usage in components
- Examine hook implementations in `lib/hooks/`
