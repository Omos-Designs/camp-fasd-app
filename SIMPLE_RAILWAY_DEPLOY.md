# Simple Railway Deployment
## Deploy to Railway - No Custom Domain Needed

This guide deploys your app to Railway with its own Railway URL. You can then link to it from your Squarespace site.

**Final URL will be**: `https://camp-fasd-app.up.railway.app` (or similar)

---

## Step 1: Push Code to GitHub

```bash
# Add all changes
git add .

# Commit
git commit -m "Add Google OAuth and Railway deployment configuration"

# Push to GitHub
git push origin master
```

---

## Step 2: Deploy on Railway

### 2.1 Create Railway Account

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign in with GitHub
4. Authorize Railway to access your repositories

### 2.2 Deploy Backend

1. Click **"+ New Project"** → **"Deploy from GitHub repo"**
2. Select `camp-fasd-app` repository
3. Railway will create a service
4. In Service Settings:
   - **Name**: `camp-fasd-backend`
   - **Root Directory**: `backend`
   - Click **"Save"**

5. Add **Environment Variables** (click "Variables" tab):
   ```
   DATABASE_URL=postgresql://postgres:YOUR_DATABASE_PASSWORD@db.mtxjtriqduylfakqeiod.supabase.co:5432/postgres
   SECRET_KEY=09e8c5f7a3b2d4e6f8a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=43200
   GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
   ```

6. Click **"Deploy"**
7. Wait 2-3 minutes
8. Copy the URL (e.g., `https://camp-fasd-backend-production.up.railway.app`)

### 2.3 Deploy Frontend

1. In same project, click **"+ New"** → **"Service"**
2. Select **"GitHub Repo"** → Choose `camp-fasd-app`
3. In Service Settings:
   - **Name**: `camp-fasd-frontend`
   - **Root Directory**: `frontend`
   - Click **"Save"**

4. Add **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://YOUR_BACKEND_URL.up.railway.app
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
   NEXT_PUBLIC_SUPABASE_URL=https://mtxjtriqduylfakqeiod.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eGp0cmlxZHV5bGZha3FlaW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTI3ODAsImV4cCI6MjA2MDMyODc4MH0.YGCdGdnzDrXWWJx-u_vLaCVPpYeQOlk9JJJOq2LJz-c
   ```

   **⚠️ IMPORTANT**: Replace `YOUR_BACKEND_URL` with the actual backend URL from step 2.2!

5. Click **"Deploy"**
6. Wait 3-4 minutes
7. Copy the frontend URL (e.g., `https://camp-fasd-app-production.up.railway.app`)

### 2.4 Update Backend CORS

1. Go back to **Backend service** → **"Variables"**
2. Add new variable:
   ```
   ALLOWED_ORIGINS=https://YOUR_FRONTEND_URL.up.railway.app
   ```
   Replace with actual frontend Railway URL from step 2.3

3. Backend will auto-redeploy

---

## Step 3: Update Google OAuth

1. Go to https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Under **Authorized JavaScript origins**, add:
   ```
   https://YOUR_FRONTEND_URL.up.railway.app
   ```
4. Under **Authorized redirect URIs**, add:
   ```
   https://YOUR_FRONTEND_URL.up.railway.app
   ```
5. Click **"Save"**
6. Wait 10-15 minutes for Google changes to propagate

---

## Step 4: Test Your Deployment

1. Go to your frontend Railway URL: `https://your-frontend-url.up.railway.app`
2. Click **"Sign in with Google"**
3. Sign in with `@fasdcamp.org` account
4. You should see the dashboard! ✅

---

## Step 5: Add Link to Squarespace Site

Now you can add this Railway URL to your Squarespace site:

### Option A: Add a Button/Link

1. Log in to Squarespace
2. Edit the page where you want to add the link
3. Add a **Button** or **Text block**
4. Link it to: `https://your-frontend-url.up.railway.app`
5. Button text: **"Staff Application Portal"** or **"Camper Applications"**

### Option B: Create a New Page

1. In Squarespace, go to **Pages**
2. Click **"+"** to add a new page
3. Name it: **"Application Portal"**
4. Add a text block with instructions:
   ```
   Welcome to the CAMP FASD Application Portal

   Staff Members: Sign in with your @fasdcamp.org Google account
   Families: Create an account to submit your application

   [Launch Application Portal Button]
   ```
5. Link the button to your Railway URL

---

## Your App URLs

After deployment, you'll have:

- **Frontend (Public)**: `https://camp-fasd-app-production.up.railway.app`
- **Backend (API)**: `https://camp-fasd-backend-production.up.railway.app`
- **Squarespace Site**: `https://fasdcamp.org` (unchanged, with link to Railway app)

---

## Team Workflow

1. **Staff**: Click link on Squarespace → Sign in with @fasdcamp.org → Auto admin access
2. **Test as families**: Create account with personal email → Fill out application
3. **Review**: Switch back to admin account → Review applications

---

## Cost

**Railway**:
- Hobby Plan: $5/month per developer
- Includes $5 monthly credit
- Estimated: $10-20/month for both services
- **OR** use free tier: 500 hours/month per service

---

## Troubleshooting

### Google OAuth Error
- Wait 10-15 minutes after updating Google Console
- Try incognito mode
- Verify Railway URL added to Google Console

### Backend Connection Error
- Check `NEXT_PUBLIC_API_URL` in frontend variables
- Verify backend is running: `https://backend-url/docs`
- Check `ALLOWED_ORIGINS` in backend variables

### Page Won't Load
- Check Railway logs: Service → "Deployments" → Click latest
- Verify all environment variables are set
- Check build logs for errors

---

## Next Steps

✅ Deploy to Railway
✅ Add link on Squarespace site
✅ Test with team
✅ Your team can start testing!

---

Last updated: 2025-10-22
