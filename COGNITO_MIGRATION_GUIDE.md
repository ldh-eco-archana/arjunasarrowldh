# Cognito Migration Guide

This document outlines the migration from Supabase authentication to AWS Cognito.

## Environment Variables Required

Add these to your `.env.dev` (and other environment files):

```
COGNITO_USER_POOL_ID=your_user_pool_id
COGNITO_CLIENT_ID=your_client_id
DEV_API_BASE_URL=https://your-api-url/v1
```

Make sure to add the `NEXT_PUBLIC_` prefix versions in your Next.js config or directly in env files:
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`

## Files Updated

### Core Authentication
- `src/lib/cognitoClient.ts` - New Cognito authentication client
- `src/lib/amplifyConfig.ts` - Amplify configuration for Cognito
- `src/utils/cognito/client.ts` - Supabase-like interface for easier migration
- `src/utils/cognito/middleware.ts` - Cognito middleware utilities

### Components & Hooks Updated
- `src/pages/login.tsx` - Updated to use Cognito authentication
- `src/hooks/useSignOut.ts` - Updated to use Cognito signOut
- `src/hooks/useAuthRedirect.ts` - Updated to use Cognito session management

### Configuration Files Updated
- `middleware.ts` - Updated to use Cognito session detection
- `next.config.js` - Added Cognito environment variables
- `src/pages/_app.tsx` - Added Amplify configuration import

## Dependencies Added
- `aws-amplify`
- `@aws-amplify/auth`
- `@aws-amplify/ui-react`

## Dependencies to Remove (Optional)
These Supabase dependencies can be removed once migration is complete:
- `@supabase/auth-helpers-nextjs`
- `@supabase/ssr`
- `@supabase/supabase-js`
- `supabase` (dev dependency)

## Migration Status

### ✅ Completed
- [x] Core authentication functions (sign in, sign out, sign up)
- [x] Login component
- [x] Auth hooks (useSignOut, useAuthRedirect)
- [x] Middleware updates
- [x] Environment configuration

### 🚧 Needs Implementation
- [ ] Password reset flow with confirmation codes
- [ ] User profile management
- [ ] Admin user creation (if needed)
- [ ] Error handling improvements
- [ ] Auth state listening (currently using polling, consider Hub events)

### 📝 Notes
1. Password update functionality is not yet implemented for Cognito
2. Auth state changes use polling instead of real-time listeners (can be improved with Amplify Hub)
3. Some Supabase-specific files still exist and can be removed after full migration
4. Consider implementing proper Cognito user attributes mapping

## Testing Checklist
- [ ] Login functionality
- [ ] Logout functionality  
- [ ] Protected route access
- [ ] Session persistence
- [ ] Error handling
- [ ] Password reset (when implemented)

## Next Steps
1. Test the login/logout flow
2. Implement proper error handling
3. Add password reset functionality
4. Remove unused Supabase dependencies
5. Update any remaining Supabase references in the codebase 