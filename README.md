# 🏠 Chore Checklist - Smart Family Task Management

A modern, gamified chore management application built with React, TypeScript, and Convex. Help families track household tasks, earn points, and build good habits together.

## 🌐 Live Demo

**Try the app:** [Deployed on Vercel](https://chore-checklist.vercel.app)

## ✨ Features

### 🎯 **Smart Chore Management**
- **Organized by Frequency**: Chores are automatically categorized into Daily, Weekly, Monthly, and Seasonal tasks
- **Difficulty-Based Points**: Easy (5 pts), Medium (10 pts), Hard (15 pts)
- **Priority Levels**: High, Medium, Low priority with visual indicators
- **Due Date Tracking**: Smart due date management with overdue warnings and early completion bonuses
- **38 Default Chores**: Pre-configured chores ready to use

### 🎮 **Gamification Features**
- **Point System**: Earn points for completing chores
- **Level Progression**: 10 levels with unique rewards and themes
- **Early Completion Bonuses**: Get bonus points for completing tasks ahead of schedule
- **Late Completion Penalties**: Reduced points for overdue tasks
- **Achievement Tracking**: Visual feedback for your progress
- **Leaderboard**: See who's leading the household chores

### 👥 **Family Management**
- **Multi-User Support**: Track chores for multiple family members
- **Household System**: Create and manage households with role-based access
- **Invite System**: Invite family members via email
- **Progress Sharing**: Celebrate achievements together

### 💰 **Reward System**
- **Point Redemption**: Request cash redemptions for earned points
- **Approval Workflow**: Parents can approve/reject redemption requests
- **Transaction History**: Track all point deductions and redemptions

### 🎨 **User Experience**
- **PWA Support**: Install as a Progressive Web App
- **Offline Support**: Works offline with service workers
- **Dark Mode**: Beautiful dark theme support
- **Responsive Design**: Optimized for mobile and desktop
- **Real-time Updates**: Live updates via Convex subscriptions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Convex account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Chore-Checklist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will:
   - Create a Convex account (if needed)
   - Set up your deployment
   - Generate a deployment URL

4. **Configure environment variables**
   
   Create a `.env.local` file:
   ```env
   VITE_CONVEX_URL=https://your-deployment.convex.cloud
   ```
   
   Get your deployment URL from the Convex dashboard or the output of `npx convex dev`.

5. **Set up Convex Auth**
   
   In your Convex dashboard, set these environment variables:
   - `CONVEX_SITE_URL`: Your site URL (e.g., `http://localhost:3000` for dev)
   - `JWT_PRIVATE_KEY`: Generated JWT private key
   - `JWKS`: Generated JWKS
   
   To generate JWT keys:
   ```bash
   node -e "const { generateKeyPair, exportPKCS8, exportJWK } = require('jose'); (async () => { const keys = await generateKeyPair('RS256', { extractable: true }); const privateKey = await exportPKCS8(keys.privateKey); const publicKey = await exportJWK(keys.publicKey); const jwks = JSON.stringify({ keys: [{ use: 'sig', ...publicKey }] }); console.log('JWT_PRIVATE_KEY=' + JSON.stringify(privateKey.trimEnd().replace(/\\n/g, ' '))); console.log('JWKS=' + jwks); })();"
   ```

6. **Seed default chores** (optional)
   
   After creating a household, you can seed default chores using the Convex dashboard:
   - Go to Functions → Run Function
   - Select `chores:adminSeedChores`
   - Pass your `householdId` as an argument

7. **Start development server**
   ```bash
   npm run dev
   ```

### Build for Production

```bash
npm run build
npm run preview
```

## 📋 Default Chores

The application comes with 38 pre-configured chores organized by frequency:

### 🌅 Daily Chores (11 chores)
- Morning Setup Routine (5 pts)
- Waste Management Protocol (5 pts)
- Kitchen Surface Optimization (5 pts)
- Dishware Cycle Management (5 pts)
- Bathroom Efficiency Check (5 pts)
- Pet Care Protocol (5 pts)
- 5-Minute Reset Sprint (5 pts)
- Kitchen Command Center Reset (10 pts)
- Floor Maintenance Protocol (10 pts)
- Living Space Optimization (10 pts)
- Plant Wellness Check (10 pts)

### 📅 Weekly Chores (12 chores)
- Sleep Environment Upgrade (5 pts)
- Complete Waste Audit (5 pts)
- Visual Clarity Enhancement (5 pts)
- Information Management Sprint (5 pts)
- Textile Care Cycle (10 pts)
- Deep Surface Restoration (10 pts)
- Bathroom System Overhaul (10 pts)
- Outdoor Ecosystem Management (10 pts)
- Weekly Nutrition Strategy (10 pts)
- Food Storage Audit (10 pts)
- Kitchen System Optimization (15 pts)
- Strategic Declutter Mission (15 pts)

### 🗓️ Monthly Chores (10 chores)
- Illumination System Maintenance (5 pts)
- Comfort Textile Refresh (5 pts)
- Airflow Optimization Protocol (5 pts)
- Cooking System Deep Clean (10 pts)
- Complete Window System Overhaul (10 pts)
- Carpet Restoration Protocol (10 pts)
- Food Inventory Optimization (10 pts)
- Wardrobe Management System (15 pts)
- Comprehensive Home Reset (15 pts)
- Storage Facility Optimization (15 pts)

### 🌸 Seasonal Chores (5 chores)
- Seasonal Aesthetic Update (5 pts)
- Clothing Inventory Transition (5 pts)
- Landscape Seasonal Strategy (10 pts)
- Climate Control System Service (10 pts)
- Comprehensive System Refresh (15 pts)

## 🔧 Technical Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - Accessible components

### Backend
- **Convex** - Backend-as-a-Service
  - Real-time database
  - Serverless functions
  - Authentication
  - File storage

### Features
- **PWA** - Progressive Web App support
- **Service Workers** - Offline functionality
- **Convex Auth** - Authentication system

## 📁 Project Structure

```
Chore-Checklist/
├── convex/              # Convex backend functions
│   ├── chores.ts        # Chore CRUD operations
│   ├── users.ts         # User management
│   ├── households.ts    # Household management
│   ├── stats.ts         # Statistics calculations
│   ├── auth.ts          # Authentication
│   └── schema.ts        # Database schema
├── src/
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   └── types/           # TypeScript types
├── public/              # Static assets
└── dist/               # Build output
```

## 🚀 Deployment

### Vercel Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

Quick steps:
1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variable: `VITE_CONVEX_URL`
4. Deploy!

### Environment Variables

**Vercel:**
- `VITE_CONVEX_URL` - Your Convex deployment URL

**Convex Dashboard:**
- `CONVEX_SITE_URL` - Your Vercel deployment URL
- `JWT_PRIVATE_KEY` - Generated JWT private key
- `JWKS` - Generated JWKS

## 🎯 Usage

### Creating a Household
1. Sign up or log in
2. Create a new household
3. Invite family members via email
4. Seed default chores (optional)

### Managing Chores
- **Add Chore**: Use the "Add Chore" form
- **Complete Chore**: Click the checkmark on any chore
- **Edit Chore**: Click the edit icon
- **Delete Chore**: Click the delete icon

### Earning Points
- Complete chores to earn points
- Early completion = bonus points
- Late completion = penalty points
- Level up as you earn more points

### Redemptions
- Request cash redemption for points
- Parents/admins can approve/reject
- Track all transactions in history

## 📚 Documentation

- [Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Migration Guide](./MIGRATION_GUIDE.md) - For migrating from localStorage
- [PWA Guide](./PWA_README.md) - PWA features and setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Convex](https://convex.dev) for the backend
- UI components inspired by [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
- Styling with [Tailwind CSS](https://tailwindcss.com)

---

**Happy Chore Tracking! 🎉**