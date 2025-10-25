# Environment Variables Guide

This document lists all environment variables required and used by StableStack.

## 📋 Quick Setup

1. Create a `.env.local` file in the root directory
2. Copy the template below
3. Fill in your actual values

---

## 🔴 REQUIRED Variables

These variables are **essential** for the application to function:

### Backend API
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
```
- **Purpose**: Backend API endpoint for all data operations
- **Format**: Must include `/api/v1` path
- **Example (ngrok)**: `https://a53338fa99da.ngrok-free.app/api/v1`
- **Example (production)**: `https://api.yourdomain.com/api/v1`
- **Used in**: All API hooks, data fetching
- **Files**: `lib/api/client.ts`, all hooks in `lib/hooks/`

### Clerk Authentication
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
```
- **Purpose**: User authentication and session management
- **Get from**: [Clerk Dashboard](https://dashboard.clerk.com)
- **Used in**: All authenticated pages, API routes
- **Files**: 
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Client components, auth UI
  - `CLERK_SECRET_KEY`: Server-side authentication
  - `CLERK_WEBHOOK_SECRET`: `app/api/webhooks/clerk/route.ts`

### Stripe Payment Processing
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```
- **Purpose**: Payment processing and webhook verification
- **Get from**: [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- **Used in**: Payment flows, webhook handling
- **Files**:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `lib/stripe.ts`, client-side payment
  - `STRIPE_SECRET_KEY`: `lib/stripe.ts`, `app/api/webhooks/stripe/route.ts`
  - `STRIPE_WEBHOOK_SECRET`: `app/api/webhooks/stripe/route.ts` (webhook verification)

**Get Webhook Secret:**
- **Dashboard**: https://dashboard.stripe.com/webhooks
- **CLI**: `stripe listen --forward-to http://localhost:3000/api/webhooks/stripe`

---

## 🟡 OPTIONAL Variables

These variables are optional but provide additional functionality:

### Redirect URLs
```env
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```
- **Purpose**: Where to redirect users after authentication
- **Default**: `/dashboard`
- **Used in**: Clerk configuration

### Base URL
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```
- **Purpose**: Base URL of your application
- **Default**: `http://localhost:3000`
- **Production**: Set to your production domain

### Monitoring & Analytics
```env
VERCEL_ANALYTICS_ID=
SENTRY_DSN=
```
- **Purpose**: Error tracking and analytics
- **Used in**: Production monitoring
- **Optional**: Leave empty if not using

### Development Settings
```env
NODE_ENV=development
STRIPE_DEBUG_MODE=true
STRIPE_TEST_MODE=false
```
- **Purpose**: Development/production mode switches
- **Auto-set**: Usually set automatically by Next.js

---

## 📝 Complete .env.local Template

Create this file in your project root:

```env
# ===========================================
# REQUIRED - BACKEND API
# ===========================================
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1

# ===========================================
# REQUIRED - CLERK AUTHENTICATION
# ===========================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_WEBHOOK_SECRET=whsec_your_secret_here

# ===========================================
# REQUIRED - STRIPE PAYMENT PROCESSING
# ===========================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# ===========================================
# OPTIONAL - REDIRECT URLS
# ===========================================
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ===========================================
# OPTIONAL - BASE URL
# ===========================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ===========================================
# OPTIONAL - MONITORING
# ===========================================
VERCEL_ANALYTICS_ID=
SENTRY_DSN=

# ===========================================
# DEVELOPMENT SETTINGS
# ===========================================
NODE_ENV=development
STRIPE_DEBUG_MODE=true
STRIPE_TEST_MODE=false
```

---

## 🔍 Variable Usage by File

### Client-Side (Browser)
- `NEXT_PUBLIC_API_URL` - All hooks in `lib/hooks/`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Auth UI, protected routes
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Payment forms, Stripe.js
- `NEXT_PUBLIC_BASE_URL` - App configuration
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - Auth redirects
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - Auth redirects

### Server-Side (API Routes)
- `CLERK_SECRET_KEY` - Token verification
- `STRIPE_SECRET_KEY` - Payment processing
- `STRIPE_WEBHOOK_SECRET` - Webhook verification (`app/api/webhooks/stripe/route.ts`)
- `CLERK_WEBHOOK_SECRET` - Webhook verification (`app/api/webhooks/clerk/route.ts`)
- `NEXT_PUBLIC_API_URL` - Webhook forwarding

---

## ✅ Verification Steps

### 1. Check Required Variables
Run this to verify your environment:
```bash
node scripts/check-stripe-config.js
```

### 2. Test API Connection
- Check browser console for `🌐 API Request:` logs
- Verify no CORS errors
- Check for `ngrok-skip-browser-warning` header in requests

### 3. Test Stripe
- Visit `/pay/[slug]` route
- Open browser console
- Check for Stripe initialization logs

### 4. Test Clerk
- Try signing in/up
- Check redirect URLs work correctly
- Verify tokens are generated

---

## 🐛 Common Issues

### Backend API Not Working
**Symptom**: `ERR_FAILED`, CORS errors, HTML instead of JSON

**Solutions**:
1. ✅ Ensure URL includes `/api/v1` path
2. ✅ Add `ngrok-skip-browser-warning` to backend CORS allowed headers
3. ✅ Check backend is running and accessible
4. ✅ Verify ngrok tunnel is active

### Clerk Authentication Failing
**Symptom**: Redirect loops, "Authentication required" errors

**Solutions**:
1. ✅ Check both publishable and secret keys are set
2. ✅ Verify keys match (test with test, live with live)
3. ✅ Clear cookies and try again
4. ✅ Check Clerk dashboard for API key status

### Stripe Payment Failing
**Symptom**: Payment form doesn't load, webhook errors

**Solutions**:
1. ✅ Use test keys in development
2. ✅ Test card: `4242 4242 4242 4242`
3. ✅ Verify webhook secret matches Stripe dashboard
4. ✅ For local dev, use Stripe CLI for webhooks

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use test keys in development** - Never use live keys locally
3. **Rotate keys regularly** - Especially after team changes
4. **Use different keys per environment** - Dev, staging, production
5. **Store production keys securely** - Use Vercel/hosting platform secrets

---

## 📚 Additional Resources

- [Clerk Setup Guide](https://clerk.com/docs)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Ngrok CORS Setup](https://ngrok.com/docs/http/traffic-policy/)

