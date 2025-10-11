# Clerk Session Configuration Guide

## Overview

Clerk uses JWT tokens that are **short-lived (1 minute)** but **automatically refresh**. For better security and user experience, configure session settings properly.

## 🎯 Understanding Clerk Sessions

### Session vs Token

- **Session** - How long a user stays logged in (can be hours/days)
- **Token** - Short-lived JWT for API calls (1 minute, auto-refreshes)

### Default Behavior

- ✅ Token expires after 1 minute
- ✅ Automatically refreshes in the background
- ✅ Session stays active based on your settings
- ✅ User doesn't need to re-login

## 🔧 Configure Session Lifetime

### Method 1: Clerk Dashboard (Recommended)

1. **Go to [Clerk Dashboard](https://dashboard.clerk.com)**
2. **Select your application**
3. **Navigate to:** Sessions → Settings
4. **Configure these settings:**

   ```
   Inactive session lifetime: 30 minutes
   (Session expires after 30 min of inactivity)

   Maximum session lifetime: 7 days
   (Absolute maximum session duration)

   Multi-session handling: Allow
   (User can be logged in on multiple devices)
   ```

5. **Save changes**

### Method 2: Environment Variables

Add to your `.env.local`:

```env
# Session will be active for 30 minutes of inactivity
CLERK_SESSION_TOKEN_LIFETIME=1800

# Maximum session duration (in seconds)
CLERK_MAX_SESSION_LIFETIME=604800  # 7 days
```

## 📝 Token Options in API Calls

For API calls that might take longer, use extended token leeway:

```typescript
import { useAuth } from "@clerk/nextjs";

const { getToken } = useAuth();

// Get token with 30-minute leeway
const token = await getToken({
  leewayInSeconds: 1800, // 30 minutes
});
```

### Using in Hooks

I've created a utility for this:

```typescript
// lib/utils/clerk-config.ts
import { getTokenWithOptions } from "@/lib/utils/clerk-config";

const { getToken } = useAuth();
const token = await getTokenWithOptions(getToken);
// Token now has 30-minute leeway
```

## 🔐 Security Best Practices

### Why Short-Lived Tokens?

1. **Security** - Compromised tokens expire quickly
2. **Revocation** - Changes take effect within 1 minute
3. **Fresh data** - Always have up-to-date user information

### Session Management

```typescript
// Check if session is active
const { isSignedIn, isLoaded } = useAuth();

if (isLoaded && !isSignedIn) {
  // Session expired - redirect to login
  router.push("/");
}
```

## 🚀 Auto-Refresh Behavior

Clerk automatically:

1. ✅ Refreshes tokens in the background
2. ✅ Maintains active sessions
3. ✅ Handles token rotation
4. ✅ Manages multiple tabs/windows

You don't need to do anything - it just works!

## 📊 Current Configuration

Your app is configured with:

```typescript
// lib/utils/clerk-config.ts
export const CLERK_TOKEN_OPTIONS = {
  leewayInSeconds: 1800, // 30 minutes
  skipCache: false, // Use cached tokens for performance
};
```

## 🛠️ Customizing Token Behavior

### For Long-Running Operations

If you have API calls that take a long time:

```typescript
const { getToken } = useAuth();

// Get fresh token with no cache
const token = await getToken({
  skipCache: true, // Always get fresh token
  leewayInSeconds: 1800, // 30-minute validity
});
```

### For Background Tasks

```typescript
// Get token that's valid for a while
const token = await getToken({
  leewayInSeconds: 3600, // 1 hour
});

// Use for background sync
await syncData(token);
```

## 📱 Session Settings in Clerk Dashboard

### Recommended Settings for Web Apps

```
✅ Inactive session lifetime: 30 minutes
   User must interact every 30 minutes to stay logged in

✅ Maximum session lifetime: 7 days
   User must re-login after 7 days regardless of activity

✅ Multi-session handling: Allow
   User can be logged in on multiple devices

✅ Sign-out of all devices: Enabled
   User can sign out of all sessions at once
```

### For High-Security Apps

```
⚠️ Inactive session lifetime: 15 minutes
   Shorter timeout for sensitive data

⚠️ Maximum session lifetime: 24 hours
   Daily re-authentication required

⚠️ Multi-session handling: Single session
   Only one active session at a time
```

## 🔄 Token Refresh Flow

```
User Action → Component → Hook
                          ↓
                    getToken()
                          ↓
              Check if token expired
                          ↓
        Yes: Auto-refresh from Clerk
        No: Return cached token
                          ↓
                    API Request
```

## ⚙️ Advanced Configuration

### Custom Session Claims

Add custom data to session tokens:

```typescript
// In Clerk Dashboard → JWT Templates
{
  "userId": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "{{user.public_metadata.role}}",
  "sessionDuration": 1800
}
```

### Token Callback

Handle token refresh events:

```typescript
import { useAuth } from "@clerk/nextjs";

const { getToken } = useAuth();

// Listen for token refresh
useEffect(() => {
  const refreshToken = async () => {
    const token = await getToken({ skipCache: true });
    console.log("Token refreshed:", token);
  };

  // Refresh every 25 minutes
  const interval = setInterval(refreshToken, 25 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

## 📖 Environment Variables Summary

Add to `.env.local`:

```env
# Clerk Session Configuration
CLERK_SESSION_TOKEN_LIFETIME=1800           # 30 minutes (in seconds)
CLERK_MAX_SESSION_LIFETIME=604800           # 7 days (in seconds)

# For JWT template customization (optional)
CLERK_JWT_KEY=your_jwt_key
```

## 🎯 Best Practices

1. **Dashboard Settings** - Primary way to control sessions
2. **Token Leeway** - Use for specific long-running operations
3. **Auto-refresh** - Let Clerk handle it automatically
4. **Don't cache tokens** - Unless you need performance optimization
5. **Monitor sessions** - Use Clerk Dashboard analytics

## 🔗 Resources

- [Clerk Session Docs](https://clerk.com/docs/authentication/configuration/session-options)
- [JWT Configuration](https://clerk.com/docs/backend-requests/making/jwt-templates)
- [Token Refresh](https://clerk.com/docs/references/nextjs/use-auth#use-auth-returns)

## 💡 Quick Fix for Your Use Case

**For 30-minute session activity:**

1. Go to **Clerk Dashboard** → Your App → **Sessions**
2. Set **Inactive session lifetime** to **30 minutes**
3. Set **Maximum session lifetime** to **7 days**
4. Save changes

Your users will now stay logged in for 30 minutes of inactivity! ✅

---

**Note:** Tokens will still refresh every minute in the background, but the session will remain active for 30 minutes without user interaction.
