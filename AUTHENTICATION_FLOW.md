# Authentication Architecture - Supabase + Google OAuth

## Overview

Your app uses **Supabase for data storage** and **Google OAuth for authentication**. This is the optimal setup for your use case.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Login Flow                          │
└─────────────────────────────────────────────────────────────────┘

1. User visits: https://dev-app.fasdcamp.org
   └─> Frontend (Next.js)

2. User clicks "Sign in with Google"
   └─> Google OAuth Popup opens

3. User selects @fasdcamp.org account
   └─> Google verifies identity
   └─> Google checks: Is this @fasdcamp.org? ✓
   └─> Google returns ID token to frontend

4. Frontend sends ID token to Backend
   POST /api/auth/google
   Body: { "credential": "google_id_token" }

5. Backend (FastAPI):
   ├─> Verifies token with Google
   ├─> Checks: email ends with @fasdcamp.org? ✓
   ├─> Queries Supabase: Does user exist?
   │   ├─> YES: Load user from database
   │   └─> NO: Create new user in Supabase
   │       └─> role = "admin" (default for @fasdcamp.org)
   └─> Generates JWT access token
   └─> Returns: { access_token, user }

6. Frontend stores token
   └─> localStorage.setItem('token', access_token)
   └─> Redirects to /dashboard

7. All subsequent API calls include:
   Authorization: Bearer {token}

8. Backend validates JWT token
   └─> Queries Supabase for user permissions
   └─> Returns requested data
```

---

## Database Schema (Supabase)

Your users table in Supabase:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),  -- NULL for OAuth users
    google_id VARCHAR(255) UNIQUE,  -- Google's unique ID
    role VARCHAR(20) DEFAULT 'user',  -- user, admin, super_admin
    team VARCHAR(20),  -- ops, behavioral, med, lit
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    email_verified BOOLEAN DEFAULT false
);
```

**Key Points:**
- `google_id`: Links user to their Google account
- `password_hash`: NULL for Google OAuth users
- `role`: Automatically set to "admin" for @fasdcamp.org
- `email_verified`: Set to true from Google OAuth

---

## Authentication Methods Supported

### 1. Google OAuth (Primary - for @fasdcamp.org)
- Endpoint: `POST /api/auth/google`
- Restricted to: `@fasdcamp.org` emails only
- Default role: `admin`
- No password needed

### 2. Email/Password (Secondary - for families)
- Endpoint: `POST /api/auth/register`
- Endpoint: `POST /api/auth/login`
- For: Non-@fasdcamp.org users (families)
- Default role: `user`

---

## Google OAuth URLs Configuration

### Google Cloud Console → Credentials → OAuth 2.0 Client ID

Add these **exact URLs**:

#### Authorized JavaScript Origins
```
http://localhost:3000
http://localhost:3001
https://dev-app.fasdcamp.org
https://app.fasdcamp.org
```

#### Authorized Redirect URIs
```
http://localhost:3000
http://localhost:3001
https://dev-app.fasdcamp.org
https://app.fasdcamp.org
```

**Why these URLs?**
- `localhost:3000` - Default Next.js dev server
- `localhost:3001` - Backup port (in case 3000 is taken)
- `dev-app.fasdcamp.org` - Your dev environment
- `app.fasdcamp.org` - Your production environment (future)

**Note**: The redirect URIs are the same as JavaScript origins because we're using Google's JavaScript library (`@react-oauth/google`) which handles the redirect automatically.

---

## Environment Variables

### Backend (.env)
```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
SUPABASE_URL=https://[project].supabase.co
SUPABASE_KEY=eyJ[your-anon-key]

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz

# JWT (for session tokens)
JWT_SECRET=[generate-random-32-char-string]
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS (allow frontend domains)
ALLOWED_ORIGINS=http://localhost:3000,https://dev-app.fasdcamp.org
```

### Frontend (.env.local)
```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
# Or for production:
# NEXT_PUBLIC_API_URL=https://[your-api].railway.app

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

---

## Security Features

### 1. Domain Restriction
```typescript
// backend/app/api/auth_google.py (line 68)
if not email.endswith('@fasdcamp.org'):
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Only @fasdcamp.org email addresses are allowed"
    )
```

### 2. Google Token Verification
```typescript
// Verifies token signature with Google's public keys
idinfo = id_token.verify_oauth2_token(
    auth_data.credential,
    google_requests.Request(),
    settings.GOOGLE_CLIENT_ID
)
```

### 3. Auto-Admin for @fasdcamp.org
```typescript
// backend/app/api/auth_google.py (line 90)
user = User(
    email=email,
    google_id=google_id,
    role="admin",  // All @fasdcamp.org users are admins
    email_verified=email_verified
)
```

### 4. JWT Session Tokens
- Short-lived (24 hours)
- Signed with secret key
- Includes user ID only (no sensitive data)
- Validated on every API request

---

## Data Storage Breakdown

### What's in Supabase:
✅ Users table (all user accounts)
✅ Applications table (camper applications)
✅ Application responses (form data)
✅ Admin notes
✅ Application approvals
✅ Medications & allergies
✅ File metadata
✅ File storage (Supabase Storage)

### What's NOT in Supabase:
❌ Passwords (Google OAuth users have none)
❌ Google tokens (only used during login)
❌ Active sessions (JWT tokens stored client-side)

---

## Testing Authentication

### 1. Test Local Development

```bash
# Start backend
cd backend
.venv/bin/python -m uvicorn app.main:app --reload

# Start frontend
cd frontend
npm run dev

# Visit http://localhost:3000/login
# Click "Sign in with Google"
# Use your @fasdcamp.org account
```

### 2. Verify in Database

```sql
-- Check user was created
SELECT
    email,
    google_id,
    role,
    first_name,
    last_name,
    email_verified,
    last_login
FROM users
WHERE email = 'your@fasdcamp.org';
```

Expected result:
```
email: your@fasdcamp.org
google_id: 123456789012345678901
role: admin
first_name: Your
last_name: Name
email_verified: true
last_login: 2025-10-22 19:30:00
```

### 3. Test API with Token

```bash
# After login, copy token from localStorage
# Then test API:

curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8000/api/auth/me
```

Expected response:
```json
{
  "id": "uuid-here",
  "email": "your@fasdcamp.org",
  "role": "admin",
  "first_name": "Your",
  "last_name": "Name"
}
```

---

## Troubleshooting

### "redirect_uri_mismatch"
**Problem**: URL not in Google Console
**Solution**: Add EXACT URL (including http/https) to "Authorized redirect URIs"

### "Only @fasdcamp.org email addresses are allowed"
**Problem**: Using non-@fasdcamp.org account
**Solution**: This is correct! Only @fasdcamp.org accounts can use Google OAuth

### User created but role is "user" not "admin"
**Problem**: Logic not triggering for @fasdcamp.org
**Solution**: Check backend logs, verify email domain check

### Token expired
**Problem**: JWT token older than 24 hours
**Solution**: Log out and log back in (tokens auto-expire for security)

---

## Migration Path (If Needed)

If you want to migrate existing users to Google OAuth:

```sql
-- Link existing email to Google account
UPDATE users
SET
    google_id = '123456789012345678901',
    email_verified = true
WHERE email = 'existing@fasdcamp.org';
```

---

## Summary

**Question**: "Can we ensure we are using Supabase for authentication?"

**Answer**:
- ✅ **YES** - Supabase stores all user data
- ✅ **YES** - All authentication queries go through Supabase
- ✅ **Google OAuth** is the authentication **method**
- ✅ **Supabase** is the authentication **database**
- ✅ **JWT** is the session **mechanism**

This is the **recommended architecture** for your use case:
- Secure (Google handles password security)
- Simple (no password reset flows)
- Domain-restricted (@fasdcamp.org only)
- Full control (you own the data in Supabase)

---

## Next Steps

1. ✅ Add URLs to Google Cloud Console (see list above)
2. ✅ Deploy backend with Supabase credentials
3. ✅ Deploy frontend with Google Client ID
4. ✅ Test login with @fasdcamp.org account
5. ✅ Verify user created in Supabase with role=admin

---

Last updated: 2025-10-22
