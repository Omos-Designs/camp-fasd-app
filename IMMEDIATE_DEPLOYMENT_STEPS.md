# Immediate Deployment Steps - Get Dev App Live TODAY

This guide will get your dev app live at `https://dev-app.fasdcamp.org` with Google OAuth for `@fasdcamp.org` accounts.

**Time Estimate**: 30-60 minutes

---

## Part 1: Google OAuth Setup (15 minutes)

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Click project dropdown → "NEW PROJECT"
3. Name: "CAMP FASD Application"
4. Click "CREATE"

### Step 2: Configure OAuth (INTERNAL = Key!)

1. Left sidebar → "APIs & Services" → "OAuth consent screen"
2. **Select "INTERNAL"** ← This restricts to @fasdcamp.org only!
3. Fill in:
   - App name: CAMP FASD Application Portal
   - User support email: your@fasdcamp.org
   - Developer email: your@fasdcamp.org
4. Click "SAVE AND CONTINUE" through all screens

### Step 3: Create Credentials

1. "APIs & Services" → "Credentials"
2. "+ CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "CAMP FASD Dev"
5. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://dev-app.fasdcamp.org
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:3000
   https://dev-app.fasdcamp.org
   ```
7. Click "CREATE"
8. **COPY THESE NOW**:
   - Client ID: `123456789-abc.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-abc123xyz`

---

## Part 2: Deploy to Railway (20 minutes)

### Why Railway?
- ✅ Easiest deployment
- ✅ Automatic HTTPS
- ✅ Free $5/month credit
- ✅ Custom domains
- ✅ Zero DevOps knowledge needed

### Step 1: Sign Up

1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway to access your repo

### Step 2: Deploy Backend

1. Click "New Project" → "Deploy from GitHub repo"
2. Select `camp-fasd-app`
3. Railway detects Python automatically
4. Click "Add variables" and add ALL of these:

```bash
# Application
DEBUG=False

# Database (from your Supabase dashboard)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/[database]
SUPABASE_URL=https://[project].supabase.co
SUPABASE_KEY=eyJ[your-anon-key]

# Security
JWT_SECRET=[generate a random 32-character string]

# Google OAuth (from Step 1)
GOOGLE_CLIENT_ID=[paste your client ID]
GOOGLE_CLIENT_SECRET=[paste your client secret]

# Stripe (use test keys for now)
STRIPE_SECRET_KEY=sk_test_[your-key]
STRIPE_PUBLISHABLE_KEY=pk_test_[your-key]
STRIPE_WEBHOOK_SECRET=whsec_[your-secret]

# SendGrid (get free account at sendgrid.com)
SENDGRID_API_KEY=SG.[your-api-key]
SENDGRID_FROM_EMAIL=noreply@fasdcamp.org
SENDGRID_FROM_NAME=CAMP FASD

# CORS - Update after deploying frontend
ALLOWED_ORIGINS=http://localhost:3000,https://dev-app.fasdcamp.org
```

5. Click "Settings" → Set root directory to `/backend`
6. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Click "Deploy"
8. Wait 2-3 minutes
9. **Copy your backend URL**: `https://[your-app].up.railway.app`

### Step 3: Deploy Frontend

1. In same project, click "New" → "GitHub Repo" → select same repo
2. Railway detects Next.js automatically
3. Add variables:

```bash
NEXT_PUBLIC_API_URL=https://[your-backend-url].up.railway.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[your-google-client-id]
```

4. Settings → Set root directory to `/frontend`
5. Build command: `npm run build`
6. Start command: `npm start`
7. Click "Deploy"
8. Wait 3-4 minutes for build
9. **Copy your frontend URL**: `https://[your-app].up.railway.app`

### Step 4: Custom Domain

1. In Railway frontend service → "Settings" → "Domains"
2. Click "Custom Domain"
3. Enter: `dev-app.fasdcamp.org`
4. Railway shows you a CNAME record to add

---

## Part 3: Configure DNS in Squarespace (10 minutes)

1. Log into Squarespace
2. Settings → Domains → fasdcamp.org
3. Advanced Settings → DNS Settings
4. Click "Add Record"
5. Type: `CNAME`
6. Host: `dev-app`
7. Points To: `[value-from-railway].up.railway.app`
8. TTL: Auto
9. Save
10. **Wait 5-60 minutes for DNS propagation**

---

## Part 4: Update Google OAuth for Production (5 minutes)

1. Back to Google Cloud Console
2. Credentials → Edit your OAuth client
3. Add to **Authorized JavaScript origins**:
   ```
   https://dev-app.fasdcamp.org
   ```
4. Add to **Authorized redirect URIs**:
   ```
   https://dev-app.fasdcamp.org
   ```
5. Save

---

## Part 5: Test Everything (10 minutes)

### Test 1: Backend Health

Visit: `https://[your-backend].up.railway.app/api/health`

Should see:
```json
{
  "status": "healthy",
  "database": "connected",
  "storage": "connected"
}
```

### Test 2: Frontend Loads

Visit: `https://dev-app.fasdcamp.org`

Should see the login page

### Test 3: Google Login

1. Click "Sign in with Google" (you'll need to add this button - see below)
2. Select your @fasdcamp.org account
3. Should log you in as admin
4. Check user is created in database

---

## Frontend Google Login Integration

You need to add the Google Sign-In button to your login page. Here's the code:

### 1. Install Package

```bash
cd frontend
npm install @react-oauth/google
```

### 2. Add to Login Page

Create `frontend/app/login/GoogleLoginButton.tsx`:

```typescript
'use client'

import { GoogleLogin } from '@react-oauth/google'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'

export default function GoogleLoginButton() {
  const router = useRouter()
  const { login } = useAuth()

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      })

      const data = await response.json()

      if (response.ok) {
        // Store token and user
        localStorage.setItem('token', data.access_token)
        login(data.access_token, data.user)
        router.push('/dashboard')
      } else {
        alert(data.detail || 'Google login failed')
      }
    } catch (error) {
      console.error('Google login error:', error)
      alert('Failed to log in with Google')
    }
  }

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => alert('Google login failed')}
        useOneTap={false}
        size="large"
        text="signin_with"
        shape="rectangular"
        theme="outline"
        logo_alignment="left"
      />
    </div>
  )
}
```

### 3. Wrap Your App with Google OAuth Provider

Update `frontend/app/layout.tsx`:

```typescript
import { GoogleOAuthProvider } from '@react-oauth/google'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
```

### 4. Add Button to Login Page

In `frontend/app/login/page.tsx`, add:

```typescript
import GoogleLoginButton from './GoogleLoginButton'

// In your return statement:
<div className="space-y-4">
  <GoogleLoginButton />
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
    </div>
  </div>
  {/* Your existing email/password form */}
</div>
```

---

## Troubleshooting

### "redirect_uri_mismatch"
→ Make sure EXACT URL is in Google Console redirect URIs
→ Wait 5 minutes after adding

### "Only @fasdcamp.org email addresses are allowed"
→ This is correct! Use your @fasdcamp.org Google Workspace account
→ If you don't have one, you need to create one first

### DNS not resolving
→ Wait up to 24 hours for full propagation
→ Use `nslookup dev-app.fasdcamp.org` to check

### Backend won't connect to database
→ Check DATABASE_URL format
→ Verify Supabase allows connections from Railway IPs
→ Check Supabase dashboard for connection errors

---

## Success Checklist

- [ ] Google Cloud Project created
- [ ] OAuth configured as INTERNAL
- [ ] Client ID and Secret obtained
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Railway
- [ ] Custom domain configured in Railway
- [ ] DNS CNAME added in Squarespace
- [ ] Google OAuth updated with production URLs
- [ ] Backend `/api/health` returns success
- [ ] Frontend loads at dev-app.fasdcamp.org
- [ ] Google Sign-In button appears
- [ ] Can log in with @fasdcamp.org account
- [ ] User is created with admin role
- [ ] Can access admin dashboard

---

## What You'll Have After This

✅ Dev app live at `https://dev-app.fasdcamp.org`
✅ Secure HTTPS (automatic)
✅ Google OAuth login for team
✅ Only @fasdcamp.org accounts can log in
✅ All users are admins by default
✅ Database hosted on Supabase
✅ File storage on Supabase
✅ Ready for team testing

---

## Next Steps

1. **Test with team**: Share URL, have them log in
2. **Assign roles**: Make yourself super_admin in database
3. **Configure teams**: Assign ops, behavioral, med, lit teams
4. **Set up prod**: Repeat for `app.fasdcamp.org` when ready
5. **Enable payments**: Configure real Stripe keys
6. **Set up emails**: Configure SendGrid templates

---

## Cost Breakdown

- **Railway**: $5-15/month (includes $5 credit)
- **Supabase**: Free tier (sufficient for dev)
- **Domain**: Already owned
- **Google OAuth**: Free
- **SendGrid**: Free tier (100 emails/day)

**Total**: ~$10/month for dev environment

---

## Need Help?

**Railway Issues**: https://railway.app/help
**Google OAuth**: https://console.cloud.google.com/apis/credentials
**DNS Propagation**: https://www.whatsmydns.net

---

Last updated: 2025-10-22

**Ready to deploy? Start with Part 1!**
