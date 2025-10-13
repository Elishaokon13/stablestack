# Folder Structure

## Overview

This project follows a clean, modular architecture with clear separation of concerns.

## Directory Structure

```
stablestack/
├── app/                           # Next.js App Router
│   ├── (routes)/
│   │   ├── page.tsx               # Login/Signup page
│   │   ├── dashboard/             # Dashboard pages
│   │   ├── products/              # Product management
│   │   ├── payments/              # Payment history
│   │   ├── payment-links/         # Payment link management
│   │   ├── analytics/             # Analytics dashboard
│   │   ├── callback/              # Auth callback
│   │   └── pay/[slug]/            # Public payment pages
│   ├── api/
│   │   └── webhooks/              # Webhook endpoints (Stripe, Clerk, etc.)
│   ├── layout.tsx                 # Root layout
│   ├── not-found.tsx              # 404 page
│   └── globals.css                # Global styles
│
├── components/                    # React components
│   ├── auth/                      # Authentication components
│   │   ├── Wallet.tsx
│   │   └── WalletStatus.tsx
│   ├── dashboard/                 # Dashboard components
│   │   ├── sidebar/
│   │   └── layout/
│   ├── payment/                   # Payment components
│   │   ├── product-link-modal.tsx
│   │   └── custom-payment-form.tsx
│   ├── forms/                     # Form components
│   │   ├── Product.tsx
│   │   ├── Payment.tsx
│   │   └── Onboarding.tsx
│   ├── cards/                     # Card components
│   └── ui/                        # Base UI components (shadcn/ui)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
│
├── lib/                           # Core library code
│   ├── api/                       # API layer
│   │   └── client.ts              # Base API client
│   ├── hooks/                     # Custom React hooks
│   │   ├── payment/               # Payment domain
│   │   ├── product/               # Product domain
│   │   ├── wallet/                # Wallet domain
│   │   └── unique-name/           # Unique name domain
│   ├── types/                     # TypeScript type definitions
│   │   ├── payments.ts
│   │   ├── dashboard.ts
│   │   └── index.ts
│   ├── models/                    # Data models
│   │   ├── Payment.ts
│   │   ├── Product.ts
│   │   └── User.ts
│   └── utils.ts                   # Utility functions
│
├── hooks/                         # Global hooks
│   └── use-mobile.ts
│
├── config/                        # Configuration files
│   └── env.example
│
├── scripts/                       # Utility scripts
│   ├── auto-commit.js
│   └── auto-commit-interval.js
│
├── docs/                          # Documentation
│   ├── API_INTEGRATION.md
│   └── FOLDER_STRUCTURE.md
│
├── public/                        # Static assets
│   ├── assets/
│   ├── avatars/
│   └── fonts/
│
├── middleware.ts                  # Clerk authentication middleware
├── .env.local                     # Environment variables
└── package.json                   # Dependencies
```

## Key Principles

### 1. Domain-Driven Organization

Hooks are organized by business domain:

- **Payment** - All payment-related operations
- **Product** - Product CRUD and analytics
- **Wallet** - Crypto wallet operations
- **Unique Name** - User identity management

### 2. Single Responsibility

Each hook has one clear purpose:

- ❌ Bad: `useAll()` - does everything
- ✅ Good: `useEarnings()`, `useTransactions()`, `useProductStats()`

### 3. Composability

Hooks can be composed together:

```typescript
function Dashboard() {
  const { earnings } = useEarnings();
  const { stats } = useProductStats();
  const { transactions } = useTransactions();

  // Use multiple hooks together
}
```

### 4. Separation of Concerns

- **API Client** - HTTP communication
- **Hooks** - State management and data fetching
- **Components** - UI rendering
- **Types** - Data structures

### 5. Clean Imports

Use barrel exports (index.ts) for cleaner imports:

```typescript
// ❌ Bad
import { useEarnings } from "@/lib/hooks/payment/use-earnings";
import { useTransactions } from "@/lib/hooks/payment/use-transactions";

// ✅ Good
import { useEarnings, useTransactions } from "@/lib/hooks/payment";
```

## Component Organization

### UI Components (`components/ui/`)

Base components from shadcn/ui:

- Atomic, reusable components
- No business logic
- Highly customizable

### Feature Components

Domain-specific components:

- `components/payment/` - Payment features
- `components/dashboard/` - Dashboard features
- `components/auth/` - Authentication features

### Layout Components

- `app/layout.tsx` - Root layout
- `app/dashboard/layout.tsx` - Dashboard layout
- `components/dashboard/layout/` - Layout components

## Page Organization

### App Router Structure

```
app/
├── page.tsx                       # Home/Login (public)
├── dashboard/
│   ├── layout.tsx                 # Dashboard layout
│   └── page.tsx                   # Dashboard home
├── products/
│   └── page.tsx                   # Products page
├── payments/
│   └── page.tsx                   # Payments page
└── pay/[slug]/
    └── page.tsx                   # Public payment page
```

### Route Protection

Protected routes are enforced by `middleware.ts`:

- Public: `/`, `/sign-in`, `/sign-up`, `/api/webhooks/*`
- Protected: All other routes require authentication

## Data Flow

```
User Action → Component → Hook → API Client → Backend API
                ↓           ↓
              UI Update ← State ← Response
```

### Example Flow

1. User clicks "Create Product"
2. Component calls `createProduct()` from `useCreateProduct()` hook
3. Hook calls API client with authentication
4. API client sends HTTP request to backend
5. Backend responds with product data
6. Hook updates state
7. Component re-renders with new data

## Type Safety

All API requests and responses are fully typed:

```typescript
interface Product {
  id: string;
  name: string;
  priceUSD: number;
  // ... other fields
}

const product = await apiClient.get<Product>("/product/123");
// product is fully typed as Product
```

## Error Handling Strategy

### Three Levels

1. **API Client** - Catches network errors, HTTP errors
2. **Hooks** - Catches domain errors, exposes error state
3. **Components** - Displays user-friendly error messages

### Example

```typescript
// Component
const { data, loading, error } = useHook();

if (error) {
  return <Alert variant="destructive">{error}</Alert>;
}
```

## Testing Strategy

### Unit Tests

- Test hooks in isolation
- Mock API client
- Test all states (loading, success, error)

### Integration Tests

- Test component + hook integration
- Mock backend responses
- Test user workflows

### E2E Tests

- Test complete user flows
- Real backend (staging environment)
- Critical paths only

## Performance Considerations

### Code Splitting

- Lazy load heavy components with `dynamic()`
- ApexCharts loaded dynamically to reduce initial bundle

### Data Fetching

- Hooks provide `autoFetch` option to control when data is fetched
- `refetch()` function for manual refetching
- Pagination for large datasets

### State Management

- Local state with React hooks (current)
- Can upgrade to React Query for:
  - Automatic caching
  - Background refetching
  - Optimistic updates

## Environment Configuration

### Development

```env
NEXT_PUBLIC_API_URL=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Production

Same variables but with production values.

## Deployment

### Vercel (Recommended)

1. Connect repository
2. Set environment variables
3. Deploy automatically on push

### Build Process

```bash
npm run build  # Creates production build
npm start      # Starts production server
```

## Contributing Guidelines

When adding new features:

1. **Create a hook** for API operations
2. **Organize by domain** (payment, product, wallet, etc.)
3. **Export from index.ts** for clean imports
4. **Add TypeScript types** for all data structures
5. **Handle errors** comprehensively
6. **Document** in this guide

## References

- [Teach Yourself CS](https://teachyourselfcs.com/) - Software engineering principles
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [React Hooks](https://react.dev/reference/react) - Hook patterns
- [Clerk Docs](https://clerk.com/docs) - Authentication

---

**Last Updated:** October 10, 2025
