# Deployment Checklist

Use this checklist to ensure your app is ready for production deployment.

## Pre-Deployment

### ✅ Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console.log statements in production code
- [ ] All test files pass (if applicable)
- [ ] Code is properly formatted
- [ ] No sensitive data in code (API keys, secrets, etc.)

### ✅ Convex Setup
- [ ] Convex backend deployed and running
- [ ] Convex deployment URL obtained
- [ ] Convex environment variables set:
  - [ ] `CONVEX_SITE_URL` (your Vercel URL)
  - [ ] `JWT_PRIVATE_KEY` (generated)
  - [ ] `JWKS` (generated)
- [ ] Default chores seeded (use `chores:adminSeedChores` mutation)
- [ ] Database schema is up to date

### ✅ Environment Variables
- [ ] `.env.example` file created (if applicable)
- [ ] All required environment variables documented
- [ ] Vercel environment variables configured:
  - [ ] `VITE_CONVEX_URL`

### ✅ Build Process
- [ ] `npm run build` completes successfully
- [ ] Build output in `dist/` directory
- [ ] No build warnings or errors
- [ ] PWA manifest generated correctly
- [ ] Service worker files generated

### ✅ Git Repository
- [ ] `.gitignore` includes all necessary files
- [ ] No sensitive files committed
- [ ] README.md is up to date
- [ ] All changes committed
- [ ] Repository pushed to GitHub

## Vercel Deployment

### ✅ Project Setup
- [ ] Vercel account created/connected
- [ ] GitHub repository connected to Vercel
- [ ] Project imported in Vercel dashboard

### ✅ Build Configuration
- [ ] Framework preset: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`
- [ ] Root Directory: (leave empty or set if needed)

### ✅ Environment Variables
- [ ] `VITE_CONVEX_URL` set in Vercel dashboard
- [ ] Environment variables set for production
- [ ] Preview environment variables configured (if different)

### ✅ Domain & Settings
- [ ] Custom domain configured (optional)
- [ ] Automatic deployments enabled
- [ ] Preview deployments enabled

## Post-Deployment

### ✅ Testing
- [ ] App loads correctly on Vercel URL
- [ ] Authentication works
- [ ] Chores can be created and completed
- [ ] Points system works
- [ ] Leaderboard displays correctly
- [ ] PWA installs correctly
- [ ] Service worker registers
- [ ] Offline functionality works

### ✅ Monitoring
- [ ] Error tracking set up (if applicable)
- [ ] Analytics configured (if applicable)
- [ ] Performance monitoring enabled

## Troubleshooting

If deployment fails:
1. Check Vercel build logs
2. Verify all environment variables are set
3. Ensure Convex deployment is active
4. Check that build command works locally
5. Verify `vercel.json` configuration

If app doesn't work after deployment:
1. Check browser console for errors
2. Verify `VITE_CONVEX_URL` is correct
3. Check Convex dashboard for function errors
4. Verify Convex environment variables are set
5. Check network tab for failed requests

## Quick Deploy Commands

```bash
# Build locally to test
npm run build

# Deploy to Vercel (if using Vercel CLI)
vercel --prod

# Or push to main branch for automatic deployment
git push origin main
```






