# Vercel Troubleshooting Guide

## Common Issues and Solutions

### Issue: App works locally but not on Vercel

#### 1. Missing Environment Variables

**Symptom**: App loads but shows errors, or Convex connection fails

**Solution**: 
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:
   - **Name**: `VITE_CONVEX_URL`
   - **Value**: Your Convex deployment URL (e.g., `https://silent-puma-363.convex.cloud`)
   - **Environment**: Select **Production**, **Preview**, and **Development**

4. After adding the variable, **redeploy** your application:
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Select **Redeploy**

#### 2. Build Errors

**Symptom**: Build fails in Vercel but works locally

**Check**:
- Ensure `npm run build` works locally
- Check Vercel build logs for specific errors
- Verify all dependencies are in `package.json` (not just `package-lock.json`)

**Solution**:
```bash
# Test build locally first
npm run build

# If it works locally, the issue might be:
# - Missing environment variables during build
# - Node version mismatch
```

#### 3. Runtime Errors

**Symptom**: Build succeeds but app crashes on load

**Check**:
- Open browser console on Vercel deployment
- Look for errors related to:
  - `VITE_CONVEX_URL` is undefined
  - Convex connection errors
  - Missing dependencies

**Solution**:
1. Verify environment variables are set correctly
2. Check that `CONVEX_SITE_URL` in Convex dashboard matches your Vercel URL
3. Ensure Convex deployment is active

#### 4. Routing Issues (404 errors)

**Symptom**: Direct URL access returns 404

**Solution**: 
- Verify `vercel.json` has the SPA rewrite rule:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 5. Service Worker Issues

**Symptom**: PWA features not working

**Check**:
- Verify service worker files are in `dist/` after build
- Check browser console for service worker errors

**Solution**:
- Ensure `vite-pwa.config.ts` is configured correctly
- Check that service worker headers are set in `vercel.json`

## Quick Checklist

- [ ] `VITE_CONVEX_URL` is set in Vercel environment variables
- [ ] Environment variable is set for **all environments** (Production, Preview, Development)
- [ ] Redeployed after adding environment variables
- [ ] `CONVEX_SITE_URL` in Convex dashboard matches Vercel URL
- [ ] Build completes successfully in Vercel
- [ ] No errors in browser console on deployed site
- [ ] Convex deployment is active and accessible

## Getting Help

1. **Check Vercel Build Logs**:
   - Go to your deployment in Vercel
   - Click on the deployment to see build logs
   - Look for errors or warnings

2. **Check Browser Console**:
   - Open your deployed site
   - Open browser DevTools (F12)
   - Check Console tab for errors

3. **Verify Environment Variables**:
   - In Vercel dashboard: Settings → Environment Variables
   - Ensure `VITE_CONVEX_URL` is present
   - Copy the exact value and verify it matches your Convex deployment URL

4. **Test Convex Connection**:
   - Visit your Convex dashboard
   - Check that your deployment is active
   - Verify the URL matches what's in Vercel

## Common Error Messages

### "VITE_CONVEX_URL is not set"
- **Fix**: Add the environment variable in Vercel settings

### "Failed to fetch" or Network errors
- **Fix**: Check that Convex deployment is active and URL is correct

### "Invalid deployment URL"
- **Fix**: Verify the Convex URL format: `https://your-deployment.convex.cloud`

### Build timeout
- **Fix**: Check for large dependencies or slow build steps



