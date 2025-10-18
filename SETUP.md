# CAMP FASD Application Portal - Setup Guide

This guide will walk you through setting up the CAMP FASD Application Portal for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** (or a Supabase account)
- **Git**

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/camp-fasd-app.git
cd camp-fasd-app
```

## Step 2: Set Up Supabase

### Option A: Use Supabase Cloud (Recommended)

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Note your project URL and keys from the Project Settings > API page

### Option B: Self-hosted Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
supabase init

# Start local Supabase
supabase start
```

## Step 3: Database Setup

### Run Migrations

Using Supabase CLI:
```bash
cd supabase
supabase db push
```

Or manually with psql:
```bash
psql $DATABASE_URL < migrations/001_initial_schema.sql
psql $DATABASE_URL < seed.sql
```

### Verify Setup

Connect to your database and verify tables were created:
```sql
\dt -- List all tables
SELECT * FROM users; -- Should show the super admin user
SELECT * FROM application_sections; -- Should show 17 sections
```

## Step 4: Configure Environment Variables

### Backend Environment

1. Copy the example environment file:
```bash
cd backend
cp .env.example .env
```

2. Edit `.env` and fill in your actual values:
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/camp_fasd
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# Security - Generate a secure random string
JWT_SECRET=your-secure-jwt-secret

# OAuth - Get from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe - Get from Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid - Get from SendGrid Dashboard
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@campfasd.org
```

### Frontend Environment

1. Copy the example environment file:
```bash
cd frontend
cp .env.local.example .env.local
```

2. Edit `.env.local` with your values:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Step 5: Install Dependencies

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Step 6: Configure External Services

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth client ID
5. Application type: Web application
6. Authorized redirect URIs:
   - `http://localhost:3000/auth/callback/google` (development)
   - `https://your-production-domain.com/auth/callback/google` (production)
7. Copy the Client ID and Client Secret to your environment files

### Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from Developers > API keys
3. Set up webhooks:
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-api-domain.com/api/webhooks/stripe`
   - Select events: `invoice.payment_succeeded`, `invoice.payment_failed`
   - Copy the webhook signing secret

### SendGrid Setup

1. Go to [SendGrid](https://sendgrid.com)
2. Create an API key from Settings > API Keys
3. Verify your sender email address
4. Copy the API key to your environment file

## Step 7: Run the Application

### Start Backend

```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/api/docs`

### Start Frontend

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## Step 8: Verify Installation

1. Open `http://localhost:3000` in your browser
2. You should see the CAMP FASD landing page
3. Try logging in with the default super admin:
   - Email: `admin@campfasd.org`
   - Password: `ChangeMe123!`
4. **IMPORTANT**: Change the default admin password immediately!

## Step 9: Create Storage Buckets

In Supabase Dashboard:
1. Go to Storage
2. Create a new bucket named `application-files`
3. Set the bucket to Private
4. Create policies for authenticated users

## Development Workflow

### Running Tests

Backend:
```bash
cd backend
pytest
```

Frontend:
```bash
cd frontend
npm test
```

### Code Formatting

Backend:
```bash
black app/
isort app/
flake8 app/
```

Frontend:
```bash
npm run lint
```

### Database Migrations

When you need to update the schema:
```bash
# Create a new migration
supabase migration new your_migration_name

# Edit the file in supabase/migrations/
# Then apply it
supabase db push
```

## Troubleshooting

### Backend won't start

- Check that your virtual environment is activated
- Verify all environment variables are set
- Check database connection: `psql $DATABASE_URL`

### Frontend won't start

- Delete `node_modules` and `package-lock.json`, then `npm install`
- Clear Next.js cache: `rm -rf .next`
- Check that environment variables are set

### Database connection issues

- Verify your `DATABASE_URL` is correct
- Check that PostgreSQL is running
- Ensure your IP is whitelisted in Supabase (if using cloud)

### OAuth not working

- Verify redirect URIs match exactly in Google Console
- Check that Client ID and Secret are correct
- Ensure you're using the correct protocol (http vs https)

## Next Steps

1. Change the default admin password
2. Configure email templates for your organization
3. Customize the application sections and questions as needed
4. Set up production deployment (see DEPLOYMENT.md)
5. Configure backups for your database

## Support

For issues or questions:
- Check the [documentation](./docs/)
- Review [ARCHITECTURE.md](./ARCHITECTURE.md)
- Contact: support@campfasd.org
