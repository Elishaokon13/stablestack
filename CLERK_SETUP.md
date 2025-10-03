# Clerk Authentication Setup

## 1. Create a Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up for a free account
2. Create a new application
3. Choose "Next.js" as your framework

## 2. Get Your API Keys

1. In your Clerk dashboard, go to "API Keys"
2. Copy your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

## 3. Environment Variables

Create a `.env.local` file in your project root with:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Optional: Customize Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## 4. Features Implemented

### ✅ **Login Page (`/`)**

- Beautiful landing page with sign-in/sign-up tabs
- Custom styled Clerk components
- Responsive design with glassmorphism effects
- Security messaging and feature highlights

### ✅ **Protected Dashboard (`/dashboard`)**

- User information display
- Account status and verification
- Quick action cards
- Statistics overview
- Sign out functionality

### ✅ **Auth Callback Route (`/callback`)**

- Retrieves user authentication token
- Sends token to backend API endpoint
- Verifies and processes user data
- Beautiful loading and success/error states
- Auto-redirects after authentication

### ✅ **Backend API Route (`/api/auth/callback`)**

- Verifies Clerk JWT token
- Fetches complete user details
- Ready for database integration (Prisma, Supabase, etc.)
- Secure token validation
- Error handling

### ✅ **Route Protection**

- Middleware protects all routes except public ones
- Automatic redirects to login for unauthenticated users
- Smooth user experience

### ✅ **Custom Styling**

- Dark theme with purple/blue gradients
- Glassmorphism design elements
- Animated background effects
- Consistent with your brand

## 5. Public Routes

The following routes are accessible without authentication:

- `/` - Login page
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- `/api/webhooks/*` - Webhook endpoints

All other routes require authentication.

## 6. Next Steps

1. Set up your environment variables
2. Run `npm run dev` to start the development server
3. Visit `http://localhost:3000` to see the login page
4. Create an account and test the authentication flow

## 7. Using the Callback Route

### Manual Redirect to Callback

After user signs up or logs in, redirect them to `/callback`:

```tsx
import { useRouter } from "next/navigation";

const router = useRouter();
router.push("/callback");
```

### Or Update Environment Variables

To automatically redirect after signup:

```env
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/callback
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/callback
```

### What Happens in the Callback

1. ✅ Gets user's authentication token from Clerk
2. ✅ Sends token to your backend API (`/api/auth/callback`)
3. ✅ Backend verifies the token and fetches user details
4. ✅ You can save user to database here
5. ✅ Redirects to dashboard after successful authentication

### Integrating with Your Database

Edit `/app/api/auth/callback/route.ts` to save user data:

```tsx
// Example with Prisma
await prisma.user.upsert({
  where: { clerkId: userId },
  create: {
    clerkId: userId,
    email: email,
    firstName: firstName,
    lastName: lastName,
  },
  update: {
    email: email,
    firstName: firstName,
    lastName: lastName,
  },
});
```

## 8. Customization

You can customize the Clerk appearance further by modifying the `appearance` prop in the SignIn and SignUp components in `app/page.tsx`.
