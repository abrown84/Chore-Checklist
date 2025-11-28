# Vercel Deployment Guide

## Prerequisites

1. **Convex Setup**: Deploy your Convex backend first
   ```bash
   npx convex dev
   # Follow the setup instructions and get your deployment URL
   # This will create a .convex directory with your deployment configuration
   ```

2. **Environment Variables**: Set these in your Vercel project settings:
   - `VITE_CONVEX_URL`: Your Convex deployment URL (e.g., `https://silent-puma-363.convex.cloud`)
   
   **Note**: Supabase is no longer used - the app now uses Convex Auth for authentication.

## Deployment Steps

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect this as a Vite project

2. **Configure Build Settings**:
   - Framework Preset: Vite (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Root Directory: `.` (leave as default)
   
   **Note**: The `vercel.json` file is already configured with:
   - SPA routing (all routes redirect to index.html)
   - PWA service worker headers
   - Manifest file headers

3. **Set Environment Variables**:
   - In Vercel dashboard, go to your project settings
   - Add the environment variables listed above

4. **Deploy**:
   - Vercel will automatically deploy on every push to main branch
   - Or trigger a manual deployment from the dashboard
   - Wait for the build to complete (usually 1-2 minutes)

5. **Post-Deployment**:
   - After deployment, copy your Vercel URL (e.g., `https://your-app.vercel.app`)
   - Update `CONVEX_SITE_URL` in your Convex dashboard with this URL
   - Test the app to ensure authentication works
   - (Optional) Seed default chores using the `chores:adminSeedChores` mutation in Convex dashboard

## Convex Environment Variables

In addition to `VITE_CONVEX_URL`, you also need to set these in your **Convex Dashboard** (not Vercel):

1. Go to your Convex dashboard: https://dashboard.convex.dev
2. Navigate to your deployment settings
3. Set the following environment variables:
   - `CONVEX_SITE_URL`: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - `JWT_PRIVATE_KEY`: Generated JWT private key for authentication
   - `JWKS`: Generated JWKS for authentication

To generate JWT keys, you can use:
```bash
node -e "const { generateKeyPair, exportPKCS8, exportJWK } = require('jose'); (async () => { const keys = await generateKeyPair('RS256', { extractable: true }); const privateKey = await exportPKCS8(keys.privateKey); const publicKey = await exportJWK(keys.publicKey); const jwks = JSON.stringify({ keys: [{ use: 'sig', ...publicKey }] }); console.log('JWT_PRIVATE_KEY=' + JSON.stringify(privateKey.trimEnd().replace(/\\n/g, ' '))); console.log('JWKS=' + jwks); })();"
```

## Important Notes

- The app uses Convex for the backend, so make sure your Convex deployment is active
- PWA features will work on Vercel with the provided configuration
- Service workers are properly configured for caching
- The app is a Single Page Application (SPA) with proper routing
- Authentication is handled by Convex Auth - no separate auth service needed

## Troubleshooting

### Build Issues
- **Build fails**: Check that all environment variables are set in Vercel
- **TypeScript errors**: Ensure `npm run build` works locally first
- **Missing dependencies**: Check that `package.json` includes all required packages

### Runtime Issues
- **Convex connection fails**: Verify `VITE_CONVEX_URL` is correct in Vercel
- **Authentication not working**: 
  - Check that `CONVEX_SITE_URL` in Convex matches your Vercel URL exactly
  - Verify JWT keys are set correctly in Convex dashboard
  - Check browser console for auth errors
- **Chores not loading**: Ensure Convex deployment is active and functions are deployed

### PWA Issues
- **Service worker not registering**: Check browser console for errors
- **Manifest not loading**: Verify `/manifest.webmanifest` is accessible
- **App not installable**: Check that manifest.json is properly configured

### Common Solutions
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Check Vercel deployment logs for build errors
- Check Convex dashboard logs for function errors
- Verify all environment variables are set for the correct environment (Production/Preview)
