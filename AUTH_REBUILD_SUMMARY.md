# Convex Auth System Rebuild - Summary

## What Was Wrong

### 1. **Duplicate `getCurrentUser` Queries**
- Two `getCurrentUser` queries existed: one in `convex/auth.ts` (returned just user ID) and one in `convex/users.ts` (returned full user object)
- This caused confusion and potential inconsistencies

### 2. **Incorrect Auth State Management**
- `useConvexAuth` was querying `api.auth.getCurrentUser` (which returned just an ID) and then separately querying for user data
- This created a race condition where auth state could be inconsistent
- Artificial 500ms delays were added as a workaround, which is a code smell

### 3. **Type Mismatches in authHelpers**
- `getCurrentUserId` and `requireAuth` expected `ctx: { auth: any }` but Convex Auth's `getAuthUserId` requires the full `QueryCtx` or `MutationCtx`
- This would cause runtime errors when functions tried to use these helpers

### 4. **ProtectedRoute Logic Issues**
- Complex loading state logic that could cause redirect loops
- Excessive debug logging that cluttered the console
- Race conditions between auth state and user data loading

### 5. **User Type Mismatch**
- The frontend `User` type expected different fields than what Convex returned
- Missing proper mapping between Convex user objects and frontend User type

## How the New Auth System Works

### Architecture Overview

The new auth system follows Convex Auth best practices:

1. **Single Source of Truth**: Convex Auth manages all authentication state
2. **Reactive Queries**: Frontend uses Convex's reactive queries to automatically update when auth state changes
3. **No Artificial Delays**: Relies on Convex's built-in reactivity instead of setTimeout hacks
4. **Type Safety**: Proper TypeScript types throughout the auth flow

### Backend (Convex)

#### `convex/auth.ts`
- **Purpose**: Configures Convex Auth with Password provider
- **Key Features**:
  - Password-based authentication
  - Password reset via Resend email service
  - Automatic user profile initialization on signup
  - First user automatically becomes admin
- **Removed**: Duplicate `getCurrentUser` query (now only in `users.ts`)

#### `convex/authHelpers.ts`
- **Purpose**: Helper functions for auth checks in Convex functions
- **Functions**:
  - `getCurrentUserId(ctx)`: Returns current user ID or null
  - `requireAuth(ctx)`: Returns current user ID or throws error
- **Fixed**: Now accepts proper `QueryCtx | MutationCtx` types

#### `convex/users.ts`
- **Purpose**: User data queries and mutations
- **Key Query**: `getCurrentUser` - Returns full user object or null
  - Returns `null` if not authenticated (Convex Auth handles this automatically)
  - Returns user object if authenticated
- **All Functions**: Use `getAuthUserId` or `getCurrentUserId` to check auth

#### `convex/http.ts`
- **Purpose**: HTTP routes for auth (sign in, sign out, password reset)
- **Setup**: Exports HTTP router with auth routes added

### Frontend (React)

#### `src/hooks/useConvexAuth.tsx`
- **Purpose**: Core auth hook that wraps Convex Auth
- **How It Works**:
  1. Uses `useAuthActions()` from `@convex-dev/auth/react` for sign in/out actions
  2. Queries `api.users.getCurrentUser` to get current user
  3. Maps Convex user to frontend `User` type
  4. Computes `isAuthenticated` and `isLoading` states
- **Key Changes**:
  - Removed duplicate query for user ID
  - Removed artificial 500ms delays
  - Proper loading state handling (undefined = loading, null = not authenticated, object = authenticated)

#### `src/hooks/useAuth.tsx`
- **Purpose**: Higher-level auth hook with validation and session management
- **Features**:
  - Wraps `useConvexAuth` with input validation
  - Session activity tracking for inactivity timeout
  - Enhanced error handling
- **Note**: All auth state comes from Convex - no localStorage for auth

#### `src/components/ProtectedRoute.tsx`
- **Purpose**: Route guard that shows landing page or app based on auth state
- **Flow**:
  1. While `isLoading` → show loading screen
  2. If `!isAuthenticated && !isDemoMode` → show landing page
  3. Otherwise → show app content
- **Key Changes**:
  - Simplified logic
  - Removed excessive debug logging
  - Proper loading state handling prevents redirect loops

#### `src/components/AppProviders.tsx`
- **Purpose**: Sets up Convex and Convex Auth providers
- **Setup**:
  ```tsx
  <ConvexProvider client={convex}>
    <ConvexAuthProvider client={convex}>
      {/* App */}
    </ConvexAuthProvider>
  </ConvexProvider>
  ```

## Concrete Changes Made

### Backend Files

1. **`convex/auth.ts`**
   - ✅ Removed duplicate `getCurrentUser` query
   - ✅ Kept auth configuration and password reset setup

2. **`convex/authHelpers.ts`**
   - ✅ Fixed type signatures: `ctx: QueryCtx | MutationCtx` (was `ctx: { auth: any }`)
   - ✅ Functions now work correctly with Convex Auth

3. **`convex/users.ts`**
   - ✅ `getCurrentUser` query is the single source of truth for current user
   - ✅ All functions already use `getAuthUserId` correctly

### Frontend Files

1. **`src/hooks/useConvexAuth.tsx`**
   - ✅ Removed duplicate query for user ID
   - ✅ Now queries `api.users.getCurrentUser` directly
   - ✅ Removed artificial 500ms delays
   - ✅ Fixed User type mapping (avatar, joinedAt, isActive)
   - ✅ Proper loading state: `undefined` = loading, `null` = not authenticated

2. **`src/components/ProtectedRoute.tsx`**
   - ✅ Simplified logic
   - ✅ Removed excessive debug logging
   - ✅ Proper loading state handling

3. **`src/hooks/useAuth.tsx`**
   - ✅ Already correctly wraps `useConvexAuth`
   - ✅ No changes needed (already using Convex Auth properly)

## Auth Flow

### Sign Up Flow
1. User fills out sign-up form
2. `useConvexAuth.signUp()` called with email, password, name
3. FormData sent to Convex Auth via `signInAction('password', formData)`
4. Convex Auth creates user record
5. `afterUserCreatedOrUpdated` callback sets default user fields (points, level, role, etc.)
6. Reactive query `api.users.getCurrentUser` automatically updates
7. `isAuthenticated` becomes `true`
8. `ProtectedRoute` shows app content

### Sign In Flow
1. User fills out sign-in form
2. `useConvexAuth.signIn()` called with email, password
3. FormData sent to Convex Auth via `signInAction('password', formData)`
4. Convex Auth validates credentials
5. Reactive query `api.users.getCurrentUser` automatically updates
6. `isAuthenticated` becomes `true`
7. `ProtectedRoute` shows app content

### Sign Out Flow
1. User clicks sign out
2. `useConvexAuth.signOut()` called
3. `signOutAction()` clears Convex Auth session
4. Reactive query `api.users.getCurrentUser` automatically returns `null`
5. `isAuthenticated` becomes `false`
6. `ProtectedRoute` shows landing page

## Environment Variables

### Required for Frontend
- **`VITE_CONVEX_URL`**: Your Convex deployment URL
  - Set in Vercel environment variables (for production)
  - Set in `.env.local` (for local development)
  - Example: `https://silent-puma-363.convex.cloud`

### Required for Backend (Convex Dashboard)
- **`RESEND_API_KEY`**: Your Resend API key (for password reset emails)
  - Set in Convex Dashboard → Settings → Environment Variables
  - Optional: If not set, password reset codes are logged to console (development mode)
  
- **`EMAIL_FROM`**: Email address to send password reset emails from
  - Set in Convex Dashboard → Settings → Environment Variables
  - Defaults to `onboarding@resend.dev` if not set
  - Must be verified in your Resend account

## Manual Setup Steps

### 1. Convex Dashboard Setup
1. Go to your Convex Dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:
   - `RESEND_API_KEY`: Your Resend API key (optional, for password reset)
   - `EMAIL_FROM`: Email address for password reset (optional, defaults to `onboarding@resend.dev`)

### 2. Vercel/Deployment Setup
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Ensure `VITE_CONVEX_URL` is set to your Convex deployment URL

### 3. Local Development Setup
1. Create `.env.local` file in project root (if not exists)
2. Add: `VITE_CONVEX_URL=https://your-deployment.convex.cloud`
3. Restart dev server

## Testing the Auth System

### Test Sign Up
1. Navigate to landing page
2. Click "Sign Up" or switch to sign-up mode
3. Fill in email, password, name
4. Submit form
5. ✅ Should redirect to app (not bounce back to landing)
6. ✅ User should be created in Convex
7. ✅ First user should have `role: "admin"`

### Test Sign In
1. Sign out if signed in
2. Navigate to landing page
3. Click "Sign In"
4. Fill in email and password
5. Submit form
6. ✅ Should redirect to app (not bounce back to landing)
7. ✅ User data should load correctly

### Test Sign Out
1. While signed in, click sign out
2. ✅ Should redirect to landing page
3. ✅ Protected routes should be blocked
4. ✅ User data should be cleared

### Test Protected Routes
1. While signed out, try to access app directly
2. ✅ Should redirect to landing page
3. ✅ Should show loading screen briefly, then landing page
4. ✅ No redirect loops

## Key Improvements

1. **No More Redirect Loops**: Proper loading state handling prevents "login → bounce back" issues
2. **Single Source of Truth**: Convex Auth is the only auth system (no localStorage hacks)
3. **Type Safety**: Proper TypeScript types throughout
4. **Reactive Updates**: Auth state updates automatically via Convex queries
5. **Cleaner Code**: Removed workarounds, delays, and duplicate queries
6. **Better Error Handling**: Clear error messages when auth fails

## Files Modified

### Backend
- `convex/auth.ts` - Removed duplicate query
- `convex/authHelpers.ts` - Fixed type signatures

### Frontend
- `src/hooks/useConvexAuth.tsx` - Complete rewrite for proper auth state management
- `src/components/ProtectedRoute.tsx` - Simplified logic

## Notes

- **No Breaking Changes**: The API of `useAuth` and `useConvexAuth` remains the same
- **Backward Compatible**: All existing components should work without changes
- **localStorage**: Still used for stats/migration, but NOT for auth state (as intended)
- **Demo Mode**: Still works independently of auth system

## Troubleshooting

### "Login → instantly bounced back to landing"
- **Fixed**: This was caused by incorrect loading state handling. Now fixed.

### "Not authenticated" errors in backend
- Check that functions use `getAuthUserId` or `getCurrentUserId` correctly
- Verify Convex Auth is properly configured

### Password reset not working
- Check `RESEND_API_KEY` is set in Convex Dashboard
- Check `EMAIL_FROM` is verified in Resend
- In development, codes are logged to console if Resend is not configured

### Type errors
- All TypeScript errors should be resolved
- If you see type errors, ensure you've restarted the TypeScript server



