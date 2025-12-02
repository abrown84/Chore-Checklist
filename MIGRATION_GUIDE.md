# Migration Guide: localStorage to Convex

This document describes the migration from localStorage to Convex as the primary data store.

## Overview

The app has been migrated to use Convex as the single source of truth for all persisted data. localStorage is now used only as a fallback during migration and for demo mode.

## What Was Migrated

### ✅ Completed Migrations

1. **Schema Updates**
   - Updated `convex/schema.ts` to support all user roles (admin, parent, teen, kid, member)
   - Added `redemptionRequests` table for point redemption tracking
   - Added `pointDeductions` table for tracking point deductions
   - Enhanced `householdMembers` table with role support

2. **Convex Functions**
   - `convex/chores.ts` - CRUD operations for chores
   - `convex/users.ts` - User management operations
   - `convex/households.ts` - Household management
   - `convex/stats.ts` - User statistics and leaderboard
   - `convex/redemptions.ts` - Redemption requests and point deductions
   - `convex/migrations.ts` - Migration utilities

3. **Frontend Updates**
   - `src/contexts/ChoreContext.tsx` - Now uses Convex queries/mutations
   - `src/components/AppProviders.tsx` - Passes householdId to ChoreProvider
   - `src/hooks/useCurrentHousehold.ts` - Hook to get current household
   - `src/utils/convexHelpers.ts` - Type conversion utilities

### ⚠️ Partial Migrations (Still Using localStorage Fallback)

1. **UserContext** (`src/contexts/UserContext.tsx`)
   - Still loads from localStorage on mount
   - Needs to be updated to fetch from Convex
   - Falls back to localStorage if Convex data unavailable

2. **Hooks**
   - `src/hooks/usePersistentUserStats.ts` - Still uses localStorage
   - `src/hooks/useLevelPersistence.ts` - Still uses localStorage
   - `src/hooks/usePersistentPointDeductions.ts` - Still uses localStorage
   - `src/contexts/RedemptionContext.tsx` - Still uses localStorage

3. **Authentication**
   - `src/hooks/useAuth.tsx` - Still uses localStorage for auth
   - Consider migrating to Convex Auth in the future

## Migration Process

### Automatic Migration

The app includes a migration hook (`src/hooks/useMigration.ts`) that can automatically migrate data from localStorage to Convex:

1. Check if migration is needed: `checkMigrationStatus`
2. Migrate data: `migrateFromLocalStorage()`
3. Clear localStorage after successful migration

### Manual Migration Steps

1. **Ensure Convex is configured**
   - Check that `VITE_CONVEX_URL` is set in `.env`
   - Verify Convex deployment is running

2. **Run migration**
   - The app will automatically check for migration needs
   - Use the `MigrationBanner` component to trigger migration
   - Or call `migrateFromLocalStorage()` from `useMigration` hook

3. **Verify migration**
   - Check that chores appear in Convex dashboard
   - Verify user stats are migrated
   - Confirm household is created

## Data Structure Mapping

### Chores
- **localStorage**: Array of `Chore` objects with `id: string`
- **Convex**: `chores` table with `_id: Id<"chores">`
- **Conversion**: Handled by `convexChoreToChore()` and `choreToConvexArgs()`

### Users
- **localStorage**: Array of `User` objects stored in `choreAppUsers`
- **Convex**: `users` table + `householdMembers` table
- **Note**: Users are now linked to households via `householdMembers`

### Stats
- **localStorage**: Object keyed by userId: `{ [userId]: UserStats }`
- **Convex**: `userStats` table with `userId` and `householdId` foreign keys

## Fallback Behavior

The app maintains backward compatibility:

1. **ChoreContext**: Falls back to localStorage if `householdId` is not available
2. **UserContext**: Loads from localStorage if Convex data unavailable
3. **Demo Mode**: Continues to use localStorage for demo data

## Next Steps

To complete the migration:

1. **Update UserContext** to fetch users from Convex
2. **Update hooks** to use Convex queries/mutations
3. **Update RedemptionContext** to use Convex
4. **Consider migrating auth** to Convex Auth
5. **Remove localStorage fallbacks** once migration is complete

## Testing

1. Test with existing localStorage data
2. Test migration process
3. Verify data integrity after migration
4. Test fallback behavior when Convex is unavailable
5. Test demo mode still works

## Rollback Plan

If issues occur:

1. localStorage data is preserved until explicitly cleared
2. App falls back to localStorage automatically
3. Migration can be re-run if needed
4. Convex data can be exported if needed

## Notes

- Theme preferences (`theme`) remain in localStorage (acceptable)
- Session data can remain in localStorage (acceptable)
- Demo mode continues to use localStorage (by design)






