# Chore Checklist - Project Guide

## Project Overview

A gamified household chore management app with points, levels, redemptions, and social features. Built with React, TypeScript, Vite, Convex (backend), and Tailwind CSS.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Convex (real-time database & functions)
- **Styling**: Tailwind CSS, shadcn/ui components
- **Payments**: Stripe (subscriptions & payment links)
- **Auth**: Convex Auth
- **Icons**: Phosphor Icons (6 weights: thin, light, regular, bold, fill, duotone)
- **Animations**: Custom CSS + potential anime.js integration

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── chores/         # Chore-related components
│   ├── leaderboard/    # Leaderboard components
│   ├── landing/        # Landing page components
│   └── profile/        # Profile/settings components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── config/             # Configuration files
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

convex/                 # Convex backend functions
├── chores.ts          # Chore CRUD operations
├── users.ts           # User management
├── stats.ts           # Statistics & leaderboards
├── stripe.ts          # Payment integration
└── schema.ts          # Database schema
```

## Key Features

1. **Chore Management** - Create, assign, complete chores with points
2. **Gamification** - Levels (1-10), XP, streaks, achievements
3. **Leaderboard** - Household & global rankings with multiple modes
4. **Redemption System** - Convert points to real money (100 pts = $1)
5. **Subscriptions** - Free/Pro/Premium tiers via Stripe
6. **Multi-household** - Users can belong to multiple households
7. **Real-time Updates** - Convex provides live data sync

## Important Conventions

### Component Structure
- Use functional components with TypeScript
- Export memo-wrapped components for performance: `export const MyComponent: React.FC = React.memo(() => {...})`
- Always add `displayName` after memo: `MyComponent.displayName = 'MyComponent'`

### State Management
- Use Contexts for global state (UserContext, ChoreContext, StatsContext, RedemptionContext)
- Custom hooks for reusable logic
- Convex's `useQuery` and `useMutation` for backend data

### Styling Guidelines
- Use Tailwind utility classes
- Responsive design: mobile-first (sm:, md:, lg:, xl:)
- Dark mode: always include dark: variants
- Animations: use custom CSS animations defined in index.css
- Color scheme: Primary (indigo), accent (purple), success (green), warning (yellow), destructive (red)

### File Naming
- Components: PascalCase (e.g., `ChoreList.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useSubscription.ts`)
- Utilities: camelCase (e.g., `convexHelpers.ts`)
- Types: PascalCase interfaces (e.g., `Chore`, `UserStats`)

## Key Patterns

### Feature Gates
Check subscription tier before allowing premium features:
```tsx
const { hasFeature } = useSubscription()
if (hasFeature('advanced_analytics')) {
  // Show premium feature
}
```

### Convex Queries
```tsx
const data = useQuery(api.moduleName.functionName, { arg: value })
// Returns undefined while loading, null on error, data when ready
```

### Mutations
```tsx
const mutate = useMutation(api.moduleName.functionName)
await mutate({ arg: value })
```

### Responsive Design
- Always test on mobile (320px), tablet (768px), desktop (1024px+)
- Use flex/grid with responsive breakpoints
- Hide non-essential info on mobile: `hidden md:block`

## Development Notes

### Icons
- Use Phosphor Icons: `import { IconName } from '@phosphor-icons/react'`
- Default styling via IconContext in AppProviders (size: 20, weight: 'regular')
- Available weights: thin, light, regular, bold, fill, duotone
- Common icons: Trophy, Star, Coins, CurrencyDollar, CheckCircle, Crosshair, Medal
- Override weight per icon: `<Star weight="fill" />`

### Animations
- Predefined animations in `index.css`: animate-fade-in, animate-slide-in, animate-float, animate-bounce-in
- Use `transition-all duration-300` for smooth hovers

### Points & Currency
- Conversion rate: 100 points = $1.00 (stored in `APP_CONFIG.REDEMPTION.POINTS_PER_DOLLAR`)
- Use `conversionRate` from RedemptionContext

### Levels System
- 10 levels defined in `src/types/chore.ts`
- Each level has: level number, points required, icon, title, description
- Level up triggers celebration modal

## Common Tasks

### Adding a New Component
1. Create file in appropriate folder (`src/components/`)
2. Use TypeScript with proper interfaces
3. Wrap in `React.memo()` if performance-sensitive
4. Add `displayName` property
5. Export from component file

### Adding a Convex Function
1. Add function to appropriate file in `convex/`
2. Use Convex v2 syntax: `export const myFunc = query/mutation({...})`
3. Define args with validators: `args: { userId: v.id("users") }`
4. Return typed data

### Modifying the Leaderboard
- Main component: `src/components/Leaderboard.tsx`
- List rendering: `src/components/leaderboard/LeaderboardList.tsx`
- Data processing: `src/hooks/useLeaderboardData.ts`
- Ranking modes: POINTS, EFFICIENCY, LIFETIME, CHORES (defined in `config/constants.ts`)

### Stripe Integration
- Product IDs stored in `src/config/stripe.ts`
- Webhook handling in `convex/stripe.ts`
- Payment links for subscriptions
- Test mode vs live mode based on environment

## Environment Variables

Required in `.env`:
```
VITE_CONVEX_URL=<convex_deployment_url>
CONVEX_DEPLOYMENT=<deployment_id>
STRIPE_SECRET_KEY=<stripe_key>
STRIPE_WEBHOOK_SECRET=<webhook_secret>
```

### Convex Auth JWT Keys

**IMPORTANT:** JWT keys require special formatting. See `.claude/convex-auth-setup.md` for details.

Key points:
- Use `jose` library to generate keys
- Private key must have newlines replaced with **SPACES** (not `\n` or actual line breaks)
- Keys are deployment-specific (dev vs prod)
- Error `invalid RSA PrivateKeyInfo` = malformed key format

## Design Philosophy

1. **Mobile-first** - Most users will be on phones
2. **Gamification** - Make chores fun with points, levels, achievements
3. **Family-friendly** - Clean, colorful, approachable UI
4. **Real-time** - Updates should feel instant (thanks to Convex)
5. **Performance** - Memoization, lazy loading, optimized re-renders
6. **Accessibility** - Semantic HTML, ARIA labels, keyboard navigation

## What NOT to Do

- ❌ Don't create generic "TODO" or "FIXME" comments
- ❌ Don't add features without user request
- ❌ Don't break mobile responsiveness
- ❌ Don't remove dark mode support
- ❌ Don't hardcode values that should be in config
- ❌ Don't commit console.logs (except behind `import.meta.env.DEV`)
- ❌ Don't bypass feature gates for premium features

## Useful Links

- Convex Docs: https://docs.convex.dev
- Tailwind: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- Lucide Icons: https://lucide.dev

## Recent Changes

- Updated leaderboard design with cleaner cards and better visual hierarchy
- Added subscription management system with Stripe integration
- Implemented redemption economy (points → money)
- Added global leaderboard (household rankings)
- Refactored authentication with Convex Auth
