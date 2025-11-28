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
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   - In Vercel dashboard, go to your project settings
   - Add the environment variables listed above

4. **Deploy**:
   - Vercel will automatically deploy on every push to main branch
   - Or trigger a manual deployment from the dashboard

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

- If build fails, check that all environment variables are set
- Ensure Convex deployment is active and accessible
- Check Vercel function logs for any runtime errors
- Verify PWA manifest is accessible at `/manifest.webmanifest`
