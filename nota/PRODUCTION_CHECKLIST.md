# Production Deployment Checklist

Complete this checklist before deploying to production.

## Pre-Deployment

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console.error or console.log in production code
- [ ] All unused imports removed
- [ ] All unused files deleted
- [ ] Code properly formatted and linted

### Environment Setup
- [ ] `.env.local` configured with all required variables
- [ ] `.env.example` updated with all environment variables
- [ ] Firebase project created and configured
- [ ] Neon database created and schema deployed
- [ ] All environment variables tested locally

### Security
- [ ] `.env.local` added to `.gitignore`
- [ ] No hardcoded secrets in codebase
- [ ] Firebase Email/Password authentication enabled
- [ ] Database connection uses SSL (`?sslmode=require`)
- [ ] All API routes properly secured

### Database
- [ ] Database schema created (run `schema.sql`)
- [ ] All indexes created
- [ ] Database connection tested
- [ ] Unique constraints verified

### Testing
- [ ] Authentication flow tested (signup, login, logout)
- [ ] Email verification tested
- [ ] Election creation tested
- [ ] Voting functionality tested
- [ ] Results page tested
- [ ] Excel export tested
- [ ] Three-layer security tested (email, device, IP)

## Deployment

### Vercel Setup
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Logged into Vercel (`vercel login`)
- [ ] Project linked to Vercel (`vercel link`)
- [ ] All environment variables added to Vercel
- [ ] Production build tested locally (`npm run build`)

### Environment Variables (Vercel)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `DATABASE_URL` (with `?sslmode=require`)
- [ ] `NEXT_PUBLIC_APP_BASE_URL` (production URL)

### Deploy
- [ ] Run `vercel --prod` or `npm run deploy`
- [ ] Deployment completed successfully
- [ ] Production URL received
- [ ] Build logs checked for errors

## Post-Deployment

### Firebase Configuration
- [ ] Production URL added to Firebase authorized domains
- [ ] Email verification template enabled
- [ ] Email/Password provider enabled
- [ ] Firebase quotas checked

### Verification
- [ ] Production site loads correctly
- [ ] Authentication works (signup, login, logout)
- [ ] Email verification emails being sent
- [ ] Elections can be created
- [ ] Voting works correctly
- [ ] Results page displays properly
- [ ] Excel export downloads correctly
- [ ] All links functional

### Security Verification
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Environment variables not exposed in client
- [ ] Database credentials secure
- [ ] No sensitive data in browser console
- [ ] API routes protected

### Performance
- [ ] Page load times acceptable
- [ ] Images optimized
- [ ] No console errors in browser
- [ ] Mobile responsive
- [ ] Cross-browser compatibility

### Monitoring
- [ ] Vercel deployment dashboard reviewed
- [ ] Error tracking configured
- [ ] Performance metrics monitored
- [ ] Database connection pool stable

## Optional Enhancements

### Custom Domain
- [ ] Custom domain purchased
- [ ] DNS configured in Vercel
- [ ] SSL certificate generated
- [ ] Domain added to Firebase authorized domains
- [ ] `NEXT_PUBLIC_APP_BASE_URL` updated

### Advanced Features
- [ ] Rate limiting configured
- [ ] Email templates customized
- [ ] Password reset functionality added
- [ ] User profile management added
- [ ] Admin dashboard created

### Documentation
- [ ] README.md updated with production URL
- [ ] DEPLOYMENT.md reviewed
- [ ] API documentation complete
- [ ] User guide created

## Rollback Plan

In case of issues:

1. Identify the problem in Vercel logs
2. Rollback to previous deployment:
   ```bash
   vercel list
   vercel promote [previous-deployment-url]
   ```
3. Fix the issue locally
4. Test thoroughly
5. Redeploy

## Support Contacts

- Vercel Support: https://vercel.com/support
- Firebase Support: https://firebase.google.com/support
- Neon Support: https://neon.tech/docs

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Production URL:** _______________  
**Notes:** _______________
