# Daily Bag - Project Instructions

## Overview
**Daily Bag** is a gamified family chore management app with points, levels, and streaks. Built for household coordination with parent/child roles.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Convex (serverless functions + real-time database)
- **Auth**: @convex-dev/auth (email/password)
- **UI**: Radix UI primitives + Tailwind CSS + shadcn/ui patterns
- **Animation**: Framer Motion
- **Testing**: Jest + Testing Library + Playwright
- **PWA**: vite-plugin-pwa + Workbox

## Project Structure
```
src/
├── components/     # React components (organized by feature)
├── hooks/          # Custom React hooks
├── contexts/       # React context providers
├── config/         # App configuration
├── lib/            # Shared utilities
├── types/          # TypeScript types
├── utils/          # Helper functions
└── styles/         # CSS/Tailwind styles

convex/
├── schema.ts       # Database schema (source of truth)
├── auth.ts         # Authentication setup
├── users.ts        # User mutations/queries
├── households.ts   # Household management
├── chores.ts       # Chore CRUD and completion
├── stats.ts        # Points, levels, streaks
├── redemptions.ts  # Point redemption system
├── invites.ts      # Household invites
└── cronFunctions.ts # Scheduled jobs
```

## Database Schema (Key Tables)
- `users` - User profiles with points, level, role
- `households` - Family groups with settings, join codes
- `householdMembers` - Many-to-many user<->household
- `chores` - Tasks with points, difficulty, category, status
- `choreCompletions` - Completion history with bonuses
- `userStats` - Pre-calculated stats (streaks, levels, efficiency)
- `redemptionRequests` - Point-to-cash redemption tracking

## User Roles
- `admin` - Full control
- `parent` - Manage household, approve redemptions
- `teen` - Can complete chores, limited management
- `kid` - Complete assigned chores only
- `member` - Basic participation

## Key Patterns

### Convex Functions
```typescript
// Query pattern
export const myQuery = query({
  args: { ... },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    // ...
  },
});

// Mutation pattern
export const myMutation = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    // ...
  },
});
```

### Auth Hook
```typescript
import { useConvexAuth } from "@/hooks/useConvexAuth";
const { user, isLoading, isAuthenticated } = useConvexAuth();
```

### Convex Client
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const data = useQuery(api.chores.list, { householdId });
const createChore = useMutation(api.chores.create);
```

## Commands
```bash
npm run dev          # Start dev server (Vite + Convex)
npm run build        # Production build
npm test             # Run Jest tests
npm run lint         # ESLint
npx convex dev       # Convex dev server (run separately)
npx convex deploy    # Deploy Convex to production
```

## Environment Variables
Required in `.env.local`:
```
CONVEX_DEPLOYMENT=dev:your-deployment
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

## Conventions
- Components: PascalCase (`ChoreCard.tsx`)
- Hooks: camelCase with `use` prefix (`useChores.ts`)
- Convex functions: camelCase (`createChore`, `getHousehold`)
- Types: PascalCase with descriptive names (`ChoreStatus`, `UserRole`)
- Use Radix + Tailwind for new UI components
- Follow existing patterns in similar files

## Business Model (Planned)

### Free Tier
- 1 household, up to 4 members
- Unlimited chores
- Basic points & levels system
- Leaderboard
- Point redemption

### Premium Tier ($4.99/mo or $39.99/yr)
- Unlimited household members
- Multiple households
- Custom avatar uploads
- Advanced analytics & reports
- Custom themes/colors
- Recurring chore templates
- Export data (CSV/PDF)

### Implementation Notes
- Stripe for payments
- Soft paywall approach (show features, prompt upgrade)
- 14-day free trial
- No ads
