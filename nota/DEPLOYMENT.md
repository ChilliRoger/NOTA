# Deployment Guide - Vercel CLI

This guide walks you through deploying the NOTA voting platform to Vercel using the Vercel CLI.

## Prerequisites

1. Vercel account (sign up at https://vercel.com)
2. Node.js 18 or higher installed
3. Git repository initialized
4. Environment variables configured in `.env.local`

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

## Step 3: Link Project to Vercel

Navigate to your project directory and run:

```bash
vercel link
```

This will:
- Ask you to select or create a Vercel project
- Link your local directory to the Vercel project
- Create a `.vercel` directory with project configuration

## Step 4: Configure Environment Variables

You have two options:

### Option A: Add via Vercel CLI

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_APP_BASE_URL
```

For each variable, paste the value when prompted and select the environments (production, preview, development).

### Option B: Add via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable from your `.env.local` file
5. Select appropriate environments

**Important Environment Variables:**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NEXT_PUBLIC_APP_BASE_URL=https://your-app.vercel.app
```

**Note:** Set `NEXT_PUBLIC_APP_BASE_URL` to your production URL after first deployment.

## Step 5: Deploy to Production

### First Deployment

```bash
vercel --prod
```

This will:
- Build your Next.js application
- Deploy to Vercel production environment
- Provide you with a production URL

### Subsequent Deployments

```bash
# Deploy to preview (staging)
vercel

# Deploy to production
vercel --prod
```

## Step 6: Post-Deployment Configuration

### Firebase Configuration

1. Go to Firebase Console
2. Navigate to Authentication > Settings > Authorized Domains
3. Add your Vercel production domain:
   - Example: `nota-voting.vercel.app`
4. Save changes

### Database Verification

1. Check Neon database is active
2. Verify connection string is correct
3. Ensure SSL mode is enabled
4. Test database connectivity from production

### Update Base URL

If you didn't set it initially, update the base URL:

```bash
vercel env add NEXT_PUBLIC_APP_BASE_URL production
# Enter: https://your-actual-domain.vercel.app
```

Then redeploy:

```bash
vercel --prod
```

## Step 7: Verify Deployment

1. Visit your production URL
2. Test authentication flow:
   - Sign up with new email
   - Verify email
   - Login
3. Test creating an election
4. Test voting functionality
5. Test results page and Excel export

## Common Deployment Commands

```bash
# Deploy to preview environment
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs [deployment-url]

# List all deployments
vercel list

# View environment variables
vercel env ls

# Pull environment variables to local
vercel env pull

# Remove a deployment
vercel remove [deployment-url]

# Get deployment info
vercel inspect [deployment-url]
```

## Troubleshooting

### Build Fails

```bash
# Check build locally first
npm run build

# View detailed logs
vercel logs --follow
```

### Environment Variables Not Working

```bash
# Verify environment variables are set
vercel env ls

# Pull latest environment variables
vercel env pull .env.production

# Redeploy after adding variables
vercel --prod --force
```

### Database Connection Issues

- Verify `DATABASE_URL` includes `?sslmode=require`
- Check Neon project is not in sleep mode
- Ensure database credentials are correct
- Test connection from local environment first

### Firebase Authentication Fails

- Confirm all Firebase env variables are set
- Verify authorized domains include Vercel domain
- Check Firebase Console for authentication errors
- Ensure Email/Password provider is enabled

### 404 on API Routes

- Verify all API files are in `pages/api/` directory
- Check file names match route structure
- Ensure TypeScript compiles without errors
- Review Vercel deployment logs

## Custom Domain Setup (Optional)

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your custom domain
3. Configure DNS records as shown by Vercel
4. Wait for DNS propagation (up to 48 hours)
5. Add custom domain to Firebase authorized domains
6. Update `NEXT_PUBLIC_APP_BASE_URL` environment variable

```bash
vercel domains add yourdomain.com
```

## Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

1. Connect your GitHub/GitLab/Bitbucket repository
2. Push changes to main branch for production
3. Push to other branches for preview deployments

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will automatically:
- Build the application
- Run tests (if configured)
- Deploy to production or preview
- Send deployment notifications

## Monitoring and Analytics

View your deployment metrics:

```bash
# Open project dashboard
vercel --prod
```

Or visit: https://vercel.com/dashboard

Monitor:
- Deployment status
- Build logs
- Error tracking
- Performance metrics
- Bandwidth usage

## Rollback Deployment

If something goes wrong:

```bash
# List recent deployments
vercel list

# Promote a previous deployment to production
vercel promote [deployment-url]
```

Or use the Vercel Dashboard to rollback.

## Security Best Practices

1. Never commit `.env.local` to Git
2. Use Vercel environment variables for all secrets
3. Enable Vercel's security headers
4. Set up domain verification
5. Monitor deployment logs for errors
6. Keep dependencies updated
7. Use preview deployments for testing

## Cost Considerations

Vercel Free Tier includes:
- Unlimited deployments
- 100GB bandwidth per month
- Automatic HTTPS
- Preview deployments
- Edge Network

Monitor usage in dashboard to avoid overages.

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel CLI Reference: https://vercel.com/docs/cli
- Community: https://github.com/vercel/vercel/discussions
- NOTA Issues: Open a GitHub issue in this repository

## Quick Reference

```bash
# Initial setup
npm install -g vercel
vercel login
vercel link

# Add environment variables
vercel env add [KEY]

# Deploy
vercel --prod

# Monitor
vercel logs --follow

# Rollback
vercel promote [deployment-url]
```

---

**Ready to Deploy?** Run `vercel --prod` and follow the prompts!
