# Deployment Guide - CAMP FASD Dev Environment

## Overview
This guide will help you deploy the CAMP FASD application to a public dev environment accessible at `https://fasdcamp.org/dev-app` with Google OAuth authentication for `@fasdcamp.org` accounts.

## Architecture
- **Frontend**: Next.js app (Static + API routes)
- **Backend**: FastAPI Python app
- **Database**: Supabase PostgreSQL
- **Auth**: Google OAuth 2.0
- **Domain**: fasdcamp.org (via Squarespace)
- **Hosting Options**: Railway, Render, or DigitalOcean App Platform

---

## Part 1: Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it "CAMP FASD Dev" or similar

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google+ API" or "Google OAuth2 API"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **Internal** (this restricts login to @fasdcamp.org accounts only)
3. Fill in the required fields:
   - **App name**: CAMP FASD Application Portal
   - **User support email**: your@fasdcamp.org
   - **Developer contact email**: your@fasdcamp.org
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. Save and continue

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: "CAMP FASD Dev App"
5. **Authorized JavaScript origins**:
   ```
   https://fasdcamp.org
   http://localhost:3000
   http://localhost:3001
   ```
6. **Authorized redirect URIs**:
   ```
   https://fasdcamp.org/dev-app/auth/callback/google
   http://localhost:3000/auth/callback/google
   http://localhost:3001/auth/callback/google
   ```
7. Click **Create**
8. **Save the Client ID and Client Secret** - you'll need these!

### Step 5: Restrict to @fasdcamp.org Domain

Since you selected "Internal" in the OAuth consent screen, only users with `@fasdcamp.org` Google Workspace accounts will be able to log in.

---

## Part 2: Backend Configuration

### Update Backend Environment Variables

Edit `backend/.env` or set these in your hosting platform:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://fasdcamp.org/dev-app/api/auth/google/callback

# CORS - Add your production domain
ALLOWED_ORIGINS=https://fasdcamp.org,http://localhost:3000,http://localhost:3001

# Existing vars (keep these as is)
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_secret_key
```

---

## Part 3: Hosting Setup (Choose One)

### Option A: Railway (Recommended - Easiest)

**Why Railway?**
- Automatic HTTPS
- Git-based deployments
- Simple subdomain or custom domain setup
- Free $5/month credits

**Steps:**

1. **Sign up at [railway.app](https://railway.app)**
   - Login with GitHub

2. **Deploy Backend:**
   - Click "New Project" > "Deploy from GitHub repo"
   - Select your repo
   - Railway will detect it's a Python app
   - Add environment variables (all the .env vars above)
   - Set root directory to `/backend`
   - Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Deploy Frontend:**
   - Click "New Service" > "Deploy from GitHub repo"
   - Select your repo again
   - Railway will detect Next.js
   - Set root directory to `/frontend`
   - Add environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
     NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
     ```
   - Build command: `npm run build`
   - Start command: `npm start`

4. **Custom Domain Setup:**
   - In Railway, go to your frontend service > Settings > Domains
   - Click "Custom Domain"
   - Add: `dev-app.fasdcamp.org`
   - Railway will provide DNS records (CNAME)
   - Go to Squarespace DNS settings (see Part 4)

### Option B: Render.com

**Steps:**

1. **Sign up at [render.com](https://render.com)**

2. **Deploy Backend (Web Service):**
   - New > Web Service
   - Connect GitHub repo
   - Name: `camp-fasd-api-dev`
   - Root Directory: `backend`
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add all environment variables
   - Select Free or Starter plan

3. **Deploy Frontend (Static Site):**
   - New > Static Site
   - Connect GitHub repo
   - Name: `camp-fasd-frontend-dev`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `.next`
   - Add environment variables
   - Custom domain: `dev-app.fasdcamp.org`

### Option C: DigitalOcean App Platform

**Steps:**

1. **Sign up at [digitalocean.com](https://digitalocean.com)**

2. **Create App:**
   - Apps > Create App
   - Connect GitHub repo
   - Add two components:
     - **Backend (Web Service)**:
       - Source: `/backend`
       - Run Command: `uvicorn app.main:app --host 0.0.0.0 --port 8080`
       - HTTP Port: 8080
       - Add environment variables
     - **Frontend (Web Service)**:
       - Source: `/frontend`
       - Build Command: `npm install && npm run build`
       - Run Command: `npm start`
       - HTTP Port: 3000
       - Add environment variables

3. **Custom Domain:**
   - Settings > Domains
   - Add `dev-app.fasdcamp.org`
   - DigitalOcean provides DNS records

---

## Part 4: DNS Configuration (Squarespace)

1. **Log into Squarespace**
2. Go to **Settings** > **Domains** > **fasdcamp.org**
3. Click **Advanced Settings** > **DNS Settings**

4. **Add CNAME Record** (from your hosting provider):
   ```
   Type: CNAME
   Host: dev-app
   Points To: [provided by Railway/Render/DO]
   TTL: Auto
   ```

5. **Example Values:**
   - Railway: `dev-app.fasdcamp.org` → `your-app.up.railway.app`
   - Render: `dev-app.fasdcamp.org` → `your-app.onrender.com`
   - DigitalOcean: `dev-app.fasdcamp.org` → `your-app.ondigitalocean.app`

6. **Wait for DNS Propagation** (5-60 minutes)

---

## Part 5: Environment Variables Summary

### Backend (.env)
```bash
# Application
APP_NAME=CAMP FASD Application Portal
DEBUG=False
API_VERSION=v1

# Security
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database
DATABASE_URL=postgresql://postgres:password@host:5432/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://fasdcamp.org/dev-app/api/auth/google/callback

# Stripe (can be test keys for dev)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid (for emails)
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@fasdcamp.org
SENDGRID_FROM_NAME=CAMP FASD

# CORS
ALLOWED_ORIGINS=https://fasdcamp.org,http://localhost:3000,http://localhost:3001
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## Part 6: Testing

### Test Google Login

1. Visit `https://fasdcamp.org/dev-app` (or `https://dev-app.fasdcamp.org`)
2. Click "Sign in with Google"
3. Select your `@fasdcamp.org` account
4. Should redirect back and log you in
5. Check that your user profile appears

### Test as Admin

1. In your database, update your user:
   ```sql
   UPDATE users
   SET role = 'super_admin'
   WHERE email = 'your@fasdcamp.org';
   ```
2. Log out and log back in
3. You should see admin menus

---

## Part 7: Next Steps

### Security Checklist
- [ ] Google OAuth restricted to @fasdcamp.org domain
- [ ] HTTPS enabled (automatic with Railway/Render/DO)
- [ ] JWT_SECRET is strong and unique
- [ ] Database uses strong password
- [ ] CORS only allows your domains
- [ ] File upload size limits configured
- [ ] Rate limiting considered (add middleware if needed)

### Team Onboarding
- [ ] Invite team members to Google Workspace
- [ ] Share dev app URL with team
- [ ] Document how to create admin accounts
- [ ] Set up staging/production environments

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Monitor hosting resource usage
- [ ] Set up uptime monitoring
- [ ] Configure email notifications

---

## Troubleshooting

### "Google OAuth Error: redirect_uri_mismatch"
**Solution**: Make sure the redirect URI in Google Cloud Console exactly matches your backend callback URL.

### "CORS Error"
**Solution**: Add your frontend URL to `ALLOWED_ORIGINS` in backend config.

### "Can't connect to database"
**Solution**: Check DATABASE_URL format and Supabase firewall settings.

### DNS Not Resolving
**Solution**: Wait 24 hours for full DNS propagation. Use `nslookup dev-app.fasdcamp.org` to check.

---

## Cost Estimate (Monthly)

- **Railway**: $5-20 (includes $5 credit)
- **Render**: $0 (Free tier) or $7 (Starter)
- **DigitalOcean**: $12 (Basic plan)
- **Domain**: Already owned
- **Supabase**: Free tier sufficient for dev

**Recommended for Dev**: Railway or Render Free Tier

---

## Questions?

Contact: [Your contact info]

Last updated: 2025-10-22
