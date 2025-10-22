# Vercel Deployment Guide

## Prerequisites

1. **Convex Setup**: Deploy your Convex backend first
   ```bash
   npx convex dev
   # Follow the setup instructions and get your deployment URL
   ```

2. **Environment Variables**: Set these in your Vercel project settings:
   - `VITE_CONVEX_URL`: Your Convex deployment URL
   - `VITE_SUPABASE_URL`: Your Supabase project URL (if using Supabase)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key (if using Supabase)

## Deployment Steps

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect this as a Vite project

2. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   - In Vercel dashboard, go to your project settings
   - Add the environment variables listed above

4. **Deploy**:
   - Vercel will automatically deploy on every push to main branch
   - Or trigger a manual deployment from the dashboard

## Important Notes

- The app uses Convex for the backend, so make sure your Convex deployment is active
- PWA features will work on Vercel with the provided configuration
- Service workers are properly configured for caching
- The app is a Single Page Application (SPA) with proper routing

## Troubleshooting

- If build fails, check that all environment variables are set
- Ensure Convex deployment is active and accessible
- Check Vercel function logs for any runtime errors
- Verify PWA manifest is accessible at `/manifest.webmanifest`
