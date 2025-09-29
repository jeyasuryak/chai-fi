# Chai-Fi Vercel Deployment Guide

## Prerequisites Completed ✅
- ✅ Fixed Vite configuration (removed `/chaifi` base path)
- ✅ Updated `vercel.json` for proper routing
- ✅ Build process tested and working
- ✅ Environment variables configured

## Step 1: Push to GitHub Repository

### Option A: Using GitHub CLI (Recommended)
```bash
# Install GitHub CLI if not already installed
# Visit: https://cli.github.com/

# Authenticate with GitHub
gh auth login

# Push to your repository
git push origin main
```

### Option B: Using Personal Access Token
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` permissions
3. Use the token as password when prompted:
```bash
git push origin main
# Username: jeyasuryak
# Password: [your-personal-access-token]
```

### Option C: Using SSH (Alternative)
```bash
# Add SSH key to GitHub account first
git remote set-url origin git@github.com:jeyasuryak/chai-fi.git
git push origin main
```

## Step 2: Deploy to Vercel

### Method 1: Vercel Dashboard (Easiest)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import from GitHub: `jeyasuryak/chai-fi`
4. Configure project settings:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

### Method 2: Vercel CLI
```bash
# Login to Vercel
npx vercel login

# Deploy
npx vercel --prod
```

## Step 3: Environment Variables in Vercel

Add these environment variables in Vercel Dashboard:

### Required Environment Variables:
```
MONGODB_URI=mongodb+srv://chaifimdu_db_user:chaifimdu_db_user%402025@chaifi.1dcy7wl.mongodb.net/chai-fi?retryWrites=true&w=majority&appName=Chaifi

DATABASE_URL=mongodb+srv://chaifimdu_db_user:chaifimdu_db_user%402025@chaifi.1dcy7wl.mongodb.net/chai-fi?retryWrites=true&w=majority&appName=Chaifi

SESSION_SECRET=your-super-secure-random-string-for-production-use

NODE_ENV=production
```

### How to Add Environment Variables:
1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable with its value
3. Select "Production", "Preview", and "Development" environments
4. Click "Save"

## Step 4: Verify Deployment

After deployment:
1. Check the deployment logs for any errors
2. Test the application functionality:
   - Frontend loads correctly
   - API endpoints work (`/api/...`)
   - Database connection is successful
   - Authentication works

## Project Structure (For Reference)
```
chai-fi/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types/schemas
├── dist/            # Build output
├── vercel.json      # Vercel configuration
└── package.json     # Dependencies and scripts
```

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check Node.js version compatibility
   - Ensure all dependencies are installed
   - Review build logs in Vercel dashboard

2. **API Routes Not Working**
   - Verify `vercel.json` routing configuration
   - Check that API endpoints start with `/api/`

3. **Database Connection Issues**
   - Verify MongoDB URI is correct
   - Check MongoDB Atlas network access settings
   - Ensure database user has proper permissions

4. **Static Assets Not Loading**
   - Check build output directory (`dist/public`)
   - Verify asset paths in built files

### Support Commands:
```bash
# Test build locally
npm run build

# Start production server locally
npm start

# Check Vercel deployment status
npx vercel ls

# View deployment logs
npx vercel logs [deployment-url]
```

## Security Notes
- Never commit `.env` file to repository
- Use strong, unique SESSION_SECRET for production
- Regularly rotate database credentials
- Enable MongoDB Atlas IP whitelist for security

## Next Steps After Deployment
1. Set up custom domain (optional)
2. Configure monitoring and analytics
3. Set up CI/CD pipeline for automatic deployments
4. Implement error tracking (e.g., Sentry)