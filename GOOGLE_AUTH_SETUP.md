# Google Authentication Setup Guide

## Quick Start Checklist

- [ ] Create Google Cloud Project
- [ ] Configure OAuth Consent Screen (Internal)
- [ ] Create OAuth 2.0 Credentials
- [ ] Add environment variables to backend
- [ ] Add environment variables to frontend
- [ ] Test login locally
- [ ] Deploy to production
- [ ] Update OAuth redirect URIs for production

---

## Step 1: Google Cloud Console Setup

### 1.1 Create/Select Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "NEW PROJECT"
4. Name: **CAMP FASD Application**
5. Click "CREATE"

### 1.2 Enable Required APIs

1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for and enable:
   - **Google+ API** (for user info)
   - **Google Identity Services** (for OAuth)

### 1.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **Internal** (this is KEY - only allows @fasdcamp.org)
3. Click "CREATE"
4. Fill in App Information:
   - **App name**: CAMP FASD Application Portal
   - **User support email**: [your email]@fasdcamp.org
   - **App logo**: (optional) Upload camp logo
5. App Domain (optional):
   - **Application home page**: https://fasdcamp.org
   - **Application privacy policy**: https://fasdcamp.org/privacy
   - **Application terms of service**: https://fasdcamp.org/terms
6. Developer contact information:
   - Email: [your email]@fasdcamp.org
7. Click "SAVE AND CONTINUE"

8. Scopes screen:
   - Click "ADD OR REMOVE SCOPES"
   - Select:
     - `.../auth/userinfo.email` (See your primary Google Account email address)
     - `.../auth/userinfo.profile` (See your personal info)
     - `openid` (Associate you with your personal info on Google)
   - Click "UPDATE"
   - Click "SAVE AND CONTINUE"

9. Summary screen:
   - Review your settings
   - Click "BACK TO DASHBOARD"

### 1.4 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click "+ CREATE CREDENTIALS" at the top
3. Select "OAuth client ID"
4. Application type: **Web application**
5. Name: **CAMP FASD Dev Application**
6. **Authorized JavaScript origins** (add all these):
   ```
   http://localhost:3000
   http://localhost:3001
   https://fasdcamp.org
   https://dev-app.fasdcamp.org
   ```

7. **Authorized redirect URIs** (add all these):
   ```
   http://localhost:3000
   http://localhost:3001
   https://fasdcamp.org/dev-app
   https://dev-app.fasdcamp.org
   ```

8. Click "CREATE"
9. **IMPORTANT**: A popup will show your Client ID and Client Secret
   - **Client ID**: something like `123456789-abc123.apps.googleusercontent.com`
   - **Client Secret**: something like `GOCSPX-abc123xyz789`
   - **Copy both of these immediately!**

---

## Step 2: Backend Configuration

### 2.1 Update Environment Variables

Edit `backend/.env`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

The backend code is already set up! The endpoint is:
- `POST /api/auth/google` - Accepts Google ID token, returns JWT

### 2.2 Verify Backend Config

The `backend/app/core/config.py` already includes:
```python
GOOGLE_CLIENT_ID: str
GOOGLE_CLIENT_SECRET: str
```

The authentication endpoint (`backend/app/api/auth_google.py`) will:
1. Verify the Google ID token
2. Check that email ends with `@fasdcamp.org`
3. Create or link user account
4. Set role to "admin" by default
5. Return JWT access token

---

## Step 3: Frontend Integration

### 3.1 Install Google Sign-In Library

```bash
cd frontend
npm install @react-oauth/google
```

### 3.2 Update Environment Variables

Create/edit `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### 3.3 Implementation Files Needed

I'll create these files for you:

1. **Google OAuth Context Provider**: `frontend/lib/contexts/GoogleAuthContext.tsx`
2. **Google Login Button Component**: `frontend/components/GoogleLoginButton.tsx`
3. **Updated Login Page**: Add Google button to `frontend/app/login/page.tsx`

---

## Step 4: Testing Locally

### 4.1 Start Backend

```bash
cd backend
.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4.2 Start Frontend

```bash
cd frontend
npm run dev
```

### 4.3 Test Login Flow

1. Navigate to `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Select your `@fasdcamp.org` account
4. Should redirect back logged in
5. Check that you're logged in as an admin

### 4.4 Verify in Database

```sql
SELECT email, google_id, role, first_name, last_name
FROM users
WHERE email = 'your@fasdcamp.org';
```

---

## Step 5: Production Deployment

### 5.1 Update OAuth Redirect URIs

Once you know your production URLs, add them to Google Cloud Console:

**Authorized JavaScript origins:**
```
https://api.fasdcamp.org
https://dev-app.fasdcamp.org
https://app.fasdcamp.org
```

**Authorized redirect URIs:**
```
https://dev-app.fasdcamp.org
https://app.fasdcamp.org
```

### 5.2 Update Environment Variables in Hosting Platform

**Backend (Railway/Render/DigitalOcean):**
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
ALLOWED_ORIGINS=https://dev-app.fasdcamp.org,https://app.fasdcamp.org
```

**Frontend:**
```bash
NEXT_PUBLIC_API_URL=https://api.fasdcamp.org
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## Security Features

### Automatic Security Measures

1. **Domain Restriction**: Only `@fasdcamp.org` emails can log in
2. **Email Verification**: Google verifies email ownership
3. **Token Verification**: Backend verifies Google's signature
4. **JWT Tokens**: Short-lived access tokens (24 hours)
5. **HTTPS Only**: Production requires secure connections
6. **CORS Protection**: Only allowed origins can access API

### Admin Role Assignment

By default, all `@fasdcamp.org` users are assigned the `admin` role.

To make someone a `super_admin`:
```sql
UPDATE users
SET role = 'super_admin'
WHERE email = 'admin@fasdcamp.org';
```

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem**: The redirect URI doesn't match what's in Google Console

**Solution**:
1. Go to Google Cloud Console > Credentials
2. Edit your OAuth 2.0 Client ID
3. Make sure the exact URL is in "Authorized redirect URIs"
4. Wait 5 minutes for changes to propagate

### Error: "Only @fasdcamp.org email addresses are allowed"

**Problem**: Trying to log in with wrong email domain

**Solution**:
- Use your Google Workspace `@fasdcamp.org` account
- If you don't have one, contact your admin

### Error: "Invalid Google token"

**Problem**: Token expired or client ID mismatch

**Solution**:
1. Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in frontend matches backend
2. Try logging out of Google and back in
3. Check that `GOOGLE_CLIENT_ID` in backend matches Google Console

### Users Can't See Admin Features

**Problem**: User logged in but doesn't have admin access

**Solution**:
Check their role in database:
```sql
SELECT email, role FROM users WHERE email = 'user@fasdcamp.org';
```

If role is not "admin" or "super_admin", update it:
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@fasdcamp.org';
```

---

## Testing Checklist

- [ ] Can log in with @fasdcamp.org account
- [ ] Cannot log in with non-@fasdcamp.org account
- [ ] User role is set to "admin" on first login
- [ ] JWT token is returned and stored
- [ ] Can access admin dashboard after login
- [ ] Token persists across page refreshes
- [ ] Can log out successfully
- [ ] Profile shows correct Google info (name, email)

---

## Production Readiness Checklist

- [ ] Google OAuth configured for production domains
- [ ] SSL/HTTPS enabled on all domains
- [ ] Environment variables set in hosting platform
- [ ] CORS configured for production frontend
- [ ] Database connection secure
- [ ] JWT secret is strong and unique
- [ ] Error logging configured
- [ ] Team members have @fasdcamp.org accounts
- [ ] Backup admin account created

---

## Next Steps After Setup

1. **Team Onboarding**:
   - Invite team members to Google Workspace
   - Share login URL
   - Document admin features

2. **Role Management**:
   - Designate super admins
   - Assign teams (ops, behavioral, med, lit)
   - Test permissions

3. **Production Deployment**:
   - Deploy to Railway/Render
   - Configure custom domain
   - Test production login

4. **Monitoring**:
   - Set up error tracking (Sentry)
   - Monitor login success/failures
   - Track user activity

---

## Support

For help with Google OAuth setup:
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Web](https://developers.google.com/identity/gsi/web)

Last updated: 2025-10-22
