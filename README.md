# Daily Bag

A gamified family chore management app with points, levels, and rewards.

## Features

- **Household Management** - Create and manage family groups
- **Chore Tracking** - Assign tasks with points and due dates
- **Gamification** - Earn points, level up, maintain streaks
- **Leaderboards** - Compete with family members
- **Point Redemption** - Cash out earned points
- **PWA Support** - Install as a mobile app

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Convex (real-time serverless)
- **Auth**: Convex Auth
- **UI**: Radix UI, Tailwind CSS, Framer Motion
- **Payments**: Stripe (coming soon)

## Getting Started

```bash
# Install dependencies
npm install

# Start Convex backend
npx convex dev

# Start frontend (in another terminal)
npm run dev
```

## Environment Variables

Create `.env.local`:

```
CONVEX_DEPLOYMENT=dev:your-deployment
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

## License

Private
