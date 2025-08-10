# Deployment Guide for Chore Checklist App

This guide covers multiple ways to deploy your React app through GitHub.

## Option 1: GitHub Pages (Recommended for Free Hosting)

### Prerequisites
- Your code is pushed to a GitHub repository
- Repository is public (or you have GitHub Pro for private repos)

### Setup Steps

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings" tab
   - Scroll down to "Pages" section
   - Under "Source", select "GitHub Actions"
   - The workflow file I created will handle the rest

3. **Your app will be available at:**
   `https://[your-username].github.io/chore-checklist-with-points/`

### How it works:
- The `.github/workflows/deploy.yml` file automatically builds and deploys your app
- Every time you push to the `main` branch, it triggers a new deployment
- The build process runs `npm run build` and uploads the result to GitHub Pages

## Option 2: Vercel (Alternative - Also Free)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Vercel will automatically detect it's a Vite app
6. Click "Deploy"

## Option 3: Netlify (Alternative - Also Free)

1. Go to [netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click "New site from Git"
4. Choose your repository
5. Set build command: `npm run build`
6. Set publish directory: `dist`
7. Click "Deploy site"

## Option 4: Manual Deployment

If you prefer to deploy manually:

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to any web hosting service

## Important Notes

### Environment Variables
If your app uses environment variables (like Supabase keys), you'll need to:
- For GitHub Pages: Add them in the repository settings under "Secrets and variables" → "Actions"
- For Vercel/Netlify: Add them in their respective dashboards

### Custom Domain
All platforms support custom domains if you want to use your own domain name.

### Database Considerations
- Your Supabase database will work from any of these hosting platforms
- Make sure your Supabase project allows requests from your deployment URL

## Troubleshooting

### Common Issues:
1. **Build fails:** Check the GitHub Actions logs for errors
2. **App doesn't load:** Verify the base path in `vite.config.ts` matches your repository name
3. **Environment variables missing:** Ensure they're properly set in your hosting platform

### Need Help?
- Check the GitHub Actions tab in your repository for build logs
- Verify all dependencies are in `package.json`
- Ensure your main branch is named `main` (not `master`)

## Next Steps

1. Push your code to GitHub
2. The GitHub Actions workflow will automatically deploy your app
3. Your app will be live at the GitHub Pages URL
4. Share the URL with others to test your app!

---

**Note:** The GitHub Actions workflow I created will handle the build and deployment automatically. Just push your code and it will deploy!
