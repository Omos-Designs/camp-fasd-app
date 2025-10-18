# CAMP FASD Application Portal - Deployment Guide

This guide covers deploying the CAMP FASD Application Portal to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backed up
- [ ] Email templates reviewed and customized
- [ ] Default admin password changed
- [ ] Stripe webhooks configured
- [ ] Google OAuth production redirect URIs added
- [ ] SSL certificates configured
- [ ] Domain names configured
- [ ] Backup strategy implemented

## Architecture Overview

**Recommended Production Stack:**
- Frontend: Vercel
- Backend: Railway or Render
- Database: Supabase (managed PostgreSQL)
- Storage: Supabase Storage
- CDN: Cloudflare or Vercel Edge Network

## Option 1: Deploy to Vercel (Frontend) + Railway (Backend)

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [https://railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` directory as root

3. **Configure Environment Variables**
   ```bash
   DATABASE_URL=postgresql://...
   SUPABASE_URL=https://...
   SUPABASE_KEY=...
   JWT_SECRET=...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   STRIPE_SECRET_KEY=...
   STRIPE_PUBLISHABLE_KEY=...
   STRIPE_WEBHOOK_SECRET=...
   SENDGRID_API_KEY=...
   SENDGRID_FROM_EMAIL=...
   ```

4. **Add Procfile** (in backend directory)
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

5. **Deploy**
   - Railway will auto-detect Python and deploy
   - Note your deployment URL: `https://your-app.railway.app`

### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [https://vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Import your GitHub repository
   - Framework Preset: Next.js
   - Root Directory: `frontend`

3. **Configure Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_URL=https://your-app.railway.app
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Note your URL: `https://your-app.vercel.app`

5. **Configure Custom Domain** (Optional)
   - Go to Project Settings > Domains
   - Add your custom domain (e.g., `apply.campfasd.org`)
   - Update DNS records as instructed

## Option 2: Deploy to Render

### Deploy Both Frontend and Backend to Render

1. **Create Render Account**
   - Go to [https://render.com](https://render.com)
   - Sign up with GitHub

2. **Deploy Backend**
   - New > Web Service
   - Connect repository
   - Name: `camp-fasd-api`
   - Root Directory: `backend`
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables

3. **Deploy Frontend**
   - New > Static Site
   - Connect repository
   - Name: `camp-fasd-app`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `frontend/.next`
   - Add environment variables

## Database Setup (Production)

### Using Supabase Cloud (Recommended)

1. **Create Production Project**
   - Log into Supabase
   - Create a new project (separate from development)
   - Choose a strong database password
   - Select your preferred region

2. **Run Migrations**
   ```bash
   # Set production database URL
   export DATABASE_URL="postgresql://..."

   # Run migrations
   psql $DATABASE_URL < supabase/migrations/001_initial_schema.sql
   psql $DATABASE_URL < supabase/seed.sql
   ```

3. **Configure Backups**
   - Supabase automatically backs up your database
   - Configure additional backup schedule if needed
   - Test restore procedure

4. **Create Storage Buckets**
   - Go to Storage in Supabase Dashboard
   - Create `application-files` bucket
   - Set appropriate policies

## SSL/HTTPS Configuration

### Vercel
- Automatic SSL with Let's Encrypt
- No configuration needed

### Railway
- Automatic SSL for railway.app domains
- For custom domains, SSL is automatic once DNS is configured

### Render
- Automatic SSL with Let's Encrypt
- Enabled by default

## Configure External Services for Production

### Google OAuth

1. Go to Google Cloud Console
2. Update OAuth consent screen for production
3. Add production redirect URIs:
   ```
   https://your-production-domain.com/auth/callback/google
   https://apply.campfasd.org/auth/callback/google
   ```

### Stripe Webhooks

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add production endpoint: `https://your-api-domain.com/api/webhooks/stripe`
3. Copy the new webhook signing secret
4. Update `STRIPE_WEBHOOK_SECRET` in production environment

### SendGrid

1. Verify production sender domain
2. Configure DKIM and SPF records
3. Set up dedicated IP (if needed)
4. Update email templates with production branding

## Environment Variables Reference

### Backend (Production)

```bash
# Application
DEBUG=False

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your-service-role-key

# Security
JWT_SECRET=your-very-secure-random-string-min-32-chars

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/callback/google

# Stripe (LIVE keys)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# SendGrid
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@campfasd.org

# CORS
ALLOWED_ORIGINS=["https://apply.campfasd.org"]
```

### Frontend (Production)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://api.campfasd.org
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

## Post-Deployment Steps

1. **Change Default Admin Password**
   ```bash
   # Login as admin@campfasd.org
   # Navigate to profile settings
   # Change password immediately
   ```

2. **Test All Functionality**
   - [ ] User registration
   - [ ] Google OAuth login
   - [ ] Application form submission
   - [ ] File uploads
   - [ ] Admin dashboard access
   - [ ] Email notifications
   - [ ] Stripe payment flow

3. **Configure Monitoring**
   - Set up error tracking (e.g., Sentry)
   - Configure uptime monitoring
   - Set up log aggregation
   - Create alert rules for critical issues

4. **Set Up CI/CD**
   - Configure GitHub Actions for automated tests
   - Set up automatic deployments on push to main
   - Add deployment notifications

5. **Security Hardening**
   - Enable rate limiting
   - Configure CSP headers
   - Set up WAF rules
   - Regular security audits

## Monitoring and Maintenance

### Application Monitoring

**Recommended Tools:**
- **Sentry** for error tracking
- **Datadog** or **New Relic** for APM
- **Uptime Robot** for availability monitoring

### Database Monitoring

- Monitor query performance
- Set up alerts for slow queries
- Track database size and growth
- Regular backup verification

### Log Aggregation

- Centralize logs from all services
- Set up log retention policies
- Create dashboards for key metrics

## Backup and Disaster Recovery

### Database Backups

**Supabase:**
- Daily automatic backups (included)
- Point-in-time recovery available
- Download manual backups periodically

**Additional Backups:**
```bash
# Create manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_20250101.sql
```

### File Storage Backups

- Enable versioning in Supabase Storage
- Periodic export to external storage (S3, etc.)
- Test restore procedures regularly

### Application Backups

- GitHub repository is your source of truth
- Tag releases: `git tag -a v1.0.0 -m "Release 1.0.0"`
- Maintain changelog

## Rollback Procedure

If you need to rollback a deployment:

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Railway
- Go to deployment history
- Click "Redeploy" on previous successful deployment

### Database Rollback
```bash
# Restore from backup
psql $DATABASE_URL < backup_known_good.sql
```

## Scaling Considerations

### Horizontal Scaling

- **Frontend**: Automatic with Vercel/Vercel Edge
- **Backend**: Increase instances in Railway/Render
- **Database**: Upgrade Supabase plan or connection pooling

### Performance Optimization

- Enable caching for static assets
- Implement Redis for session storage
- Use CDN for file downloads
- Optimize database queries and indexes

## Security Best Practices

1. **Regular Updates**
   - Keep dependencies up to date
   - Monitor security advisories
   - Apply patches promptly

2. **Access Control**
   - Use strong passwords
   - Enable 2FA for all admin accounts
   - Regularly audit user permissions
   - Implement least-privilege principle

3. **Data Protection**
   - Encrypt sensitive data at rest
   - Use HTTPS everywhere
   - Regular security scans
   - GDPR/privacy compliance

4. **Incident Response**
   - Document incident response plan
   - Regular security drills
   - Maintain contact list for emergencies

## Cost Optimization

### Estimated Monthly Costs (Low Traffic)

- **Supabase**: $25/month (Pro plan)
- **Vercel**: $20/month (Pro plan) or Free
- **Railway**: $5-20/month (usage-based)
- **Stripe**: Transaction fees only
- **SendGrid**: $15-20/month
- **Domain**: $12/year

**Total**: ~$70-90/month

### Cost Reduction Tips

- Use Vercel free tier for smaller deployments
- Optimize file storage usage
- Implement email batching
- Use database connection pooling

## Support and Troubleshooting

### Common Issues

**502 Bad Gateway**
- Check backend logs
- Verify environment variables
- Ensure database is accessible

**Files Not Uploading**
- Check storage bucket policies
- Verify file size limits
- Check CORS configuration

**Emails Not Sending**
- Verify SendGrid API key
- Check sender verification
- Review email logs

### Getting Help

- Review logs in your hosting platform
- Check Supabase project logs
- Monitor error tracking (Sentry)
- Contact support if needed

## Maintenance Windows

Schedule regular maintenance:
- **Weekly**: Review error logs and performance metrics
- **Monthly**: Database optimization, dependency updates
- **Quarterly**: Security audit, disaster recovery test
- **Annually**: Comprehensive system review

---

For questions or issues, contact: devops@campfasd.org
