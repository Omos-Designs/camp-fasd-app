# Local Testing Guide - Google OAuth

## Quick Setup (5 Minutes)

### Step 1: Add Your Google Client ID

Edit `.env.local` (in the root directory) and add this line:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with the Client ID from Google Cloud Console.

It should look something like: `123456789-abc123xyz.apps.googleusercontent.com`

### Step 2: Restart Frontend Server

The frontend server needs to restart to pick up the new environment variable:

1. Stop the current frontend server (Ctrl+C if running)
2. Start it again:
   ```bash
   cd frontend
   npm run dev
   ```

### Step 3: Test Login

1. Open browser to: http://localhost:3000/login (or http://localhost:3001/login)
2. You should see the "Sign in with Google" button
3. Click the button
4. Select your `@fasdcamp.org` account
5. You should be redirected and logged in!

---

## What to Expect

### ✅ Success Flow:

1. **Login page loads** - You see the Google Sign In button
2. **Click "Sign in with Google"** - Google popup opens
3. **Select @fasdcamp.org account** - Google verifies your identity
4. **Redirected back** - You're logged in!
5. **Redirected to dashboard** - Based on your role:
   - `super_admin` → `/super-admin`
   - `admin` → `/admin/applications`
   - `user` → `/dashboard`

### ❌ Common Errors:

**"Only @fasdcamp.org email addresses are allowed"**
- ✅ This is correct! You're using a non-@fasdcamp.org account
- Use your Google Workspace `@fasdcamp.org` account

**Google button doesn't appear**
- Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is in `.env.local`
- Restart the frontend server
- Check browser console for errors

**"redirect_uri_mismatch"**
- Make sure you added `http://localhost:3000` to Google Console
- See GOOGLE_AUTH_SETUP.md for exact URLs

---

## Backend Configuration Check

Make sure your `backend/.env` has:

```bash
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
```

---

## Verify User in Database

After logging in, check that your user was created:

```sql
SELECT
    email,
    google_id,
    role,
    first_name,
    last_name,
    email_verified,
    last_login,
    created_at
FROM users
WHERE email = 'your@fasdcamp.org';
```

Expected result:
```
email: your@fasdcamp.org
google_id: 123456789012345678901  (21 digits)
role: admin  (automatically set for @fasdcamp.org)
first_name: Your
last_name: Name
email_verified: true
last_login: [timestamp]
created_at: [timestamp]
```

---

## Testing Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000 (or 3001)
- [ ] `.env.local` has `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- [ ] `backend/.env` has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] Google Console has `http://localhost:3000` in redirect URIs
- [ ] Can see "Sign in with Google" button
- [ ] Can click button and see Google popup
- [ ] Can log in with @fasdcamp.org account
- [ ] Redirected to appropriate dashboard
- [ ] User created in database with role=admin
- [ ] Can access admin features

---

## Troubleshooting

### Frontend Won't Start

```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### Backend Won't Connect to Database

Check `backend/.env` has correct `DATABASE_URL`:
```bash
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

### Google Button Not Appearing

1. Check browser console (F12) for errors
2. Verify `.env.local` has the Client ID
3. Restart frontend server
4. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+F5)

### Can't See Admin Dashboard

After logging in, update your role in the database:
```sql
UPDATE users
SET role = 'super_admin'
WHERE email = 'your@fasdcamp.org';
```

Then log out and log back in.

---

## Next Steps After Local Testing

Once local testing works:

1. ✅ **Google OAuth works locally**
2. ⏭️ **Deploy to Railway** (see IMMEDIATE_DEPLOYMENT_STEPS.md)
3. ⏭️ **Configure DNS** in Squarespace
4. ⏭️ **Update Google OAuth** for production URLs
5. ⏭️ **Test with team** at dev-app.fasdcamp.org

---

## Current File Locations

- Frontend env: `.env.local` (root directory)
- Backend env: `backend/.env`
- Google login component: `frontend/components/GoogleLoginButton.tsx`
- Login page: `frontend/app/login/page.tsx`
- Backend Google OAuth: `backend/app/api/auth_google.py`

---

## Quick Commands

```bash
# Start backend
cd backend
.venv/bin/python -m uvicorn app.main:app --reload

# Start frontend
cd frontend
npm run dev

# Check backend health
curl http://localhost:8000/api/health

# View backend logs
# (Check terminal where backend is running)

# View frontend logs
# (Check terminal where frontend is running)
```

---

Last updated: 2025-10-22
