# Supabase JWT Secret Setup

## Required Environment Variable

To use the fast authentication optimization, you need to add your Supabase JWT Secret to your `.env` file.

## Steps to Get Your JWT Secret:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Look for **JWT Settings** section
5. Copy the **JWT Secret** (this is different from your anon key or service role key)

## Add to .env file:

Add this line to your `.env` file:

```
SUPABASE_JWT_SECRET=your-jwt-secret-here
```

**Important:** 
- This is a **private key** and should never be exposed publicly
- This secret is used to verify JWT tokens server-side for fast authentication
- Without this, the application will fall back to slower authentication methods

## What This Optimization Provides:

✅ **Faster Server-Side Authentication**: JWT verification is much faster than Supabase's `getUser()` method  
✅ **Security**: Still maintains security by verifying the JWT signature  
✅ **Better User Experience**: Faster page loads on protected routes like dashboard and login redirects  
✅ **Reduced Supabase API Calls**: Less load on your Supabase instance  

## Files Updated:

**Core Authentication:**
- `src/utils/supabase/safe-session.ts` - New JWT verification class
- `src/utils/supabase/server.ts` - Added helper function `getSafeUser()` with fallback
- `src/utils/supabase/middleware.ts` - Optimized to avoid expensive `getUser()` calls

**Pages with Fast Authentication:**
- `src/pages/dashboard.tsx` - Uses fast JWT authentication
- `src/pages/login.tsx` - Uses fast authentication for redirect checks
- `src/pages/profile.tsx` - Uses fast authentication
- `src/pages/change-password.tsx` - Uses fast authentication  
- `src/pages/chapter/[id].tsx` - Uses fast authentication

**Sign-Out Optimization:**
- `src/hooks/useSignOut.ts` - New hook for instant sign-out with background logout
- `src/components/navigation/navigation.tsx` - Uses optimized sign-out
- All sign-out buttons now redirect immediately for better UX

## Reference:

Based on the optimization shared by [@anarkrypto](https://gist.github.com/anarkrypto/9ee98bd23f25efd44a4cfb4ed256837a)

For more details about the Supabase SSR performance issue, see: https://github.com/orgs/supabase/discussions/23224 