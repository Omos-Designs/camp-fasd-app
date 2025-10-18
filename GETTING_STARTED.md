# Getting Started - CAMP FASD Application Portal

**Welcome!** This guide will help you get started with developing the CAMP FASD Application Portal.

## 🎯 Quick Start (5 Minutes)

If you want to dive right in:

```bash
# 1. Clone and setup
git clone https://github.com/your-org/camp-fasd-app.git
cd camp-fasd-app

# 2. Read the current status
cat PROJECT_STATUS.md

# 3. Follow the detailed setup
open SETUP.md
```

## 📚 Essential Reading Order

1. **[README.md](README.md)** (5 min) - Project overview and tech stack
2. **[PROJECT_STATUS.md](PROJECT_STATUS.md)** (10 min) - What's done and what's next
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** (15 min) - System design and database schema
4. **[SETUP.md](SETUP.md)** (30 min) - Set up your development environment

## 🏗️ Current State of the Project

### ✅ What's Complete
- **Full project structure** for frontend and backend
- **Complete database schema** with 17 application sections
- **Seed data** including super admin user and sample questions
- **All configuration files** for Next.js, FastAPI, Tailwind, etc.
- **Comprehensive documentation** for setup, deployment, and architecture
- **Brand design system** with CAMP colors integrated

### 🚧 What Needs Building
- **Backend API endpoints** (authentication, applications, admin, payments)
- **Frontend pages and components** (all UI needs to be built)
- **Integration with Stripe** for payments
- **Integration with SendGrid** for emails
- **File upload/download** functionality
- **Admin dashboard** interface
- **Super admin** configuration tools

### 📊 Project Progress
**Estimated Completion: 15% (Foundation)**
- Foundation & Architecture: ✅ 100%
- Backend Implementation: ⏳ 0%
- Frontend Implementation: ⏳ 0%
- Testing: ⏳ 0%
- Deployment: ⏳ 0%

## 🎓 Understanding the System

### The Big Picture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Families  │────────▶│   Next.js    │────────▶│   FastAPI   │
│  (Users)    │  Browse │   Frontend   │   API   │   Backend   │
└─────────────┘         └──────────────┘         └──────┬──────┘
                                                         │
                        ┌──────────────────┬─────────────┴────────┬──────────────┐
                        │                  │                      │              │
                        ▼                  ▼                      ▼              ▼
                  ┌──────────┐      ┌──────────┐         ┌────────────┐  ┌──────────┐
                  │ Supabase │      │  Stripe  │         │  SendGrid  │  │  Google  │
                  │ Postgres │      │ Payments │         │   Emails   │  │  OAuth   │
                  │ + Storage│      └──────────┘         └────────────┘  └──────────┘
                  └──────────┘
```

### User Roles

1. **User (Family)**:
   - Register and create applications
   - Fill out multi-section form
   - Upload required documents
   - View application status
   - Pay invoice when accepted

2. **Admin**:
   - View all applications
   - Review and approve/decline
   - Leave internal notes
   - Assign cabins to accepted campers
   - Three teams: Ops, Behavioral, Medical

3. **Super Admin**:
   - Everything admins can do, plus:
   - Configure application questions
   - Manage email templates
   - Set invoice amounts and scholarships
   - Reset applications for new season
   - Manage user roles

### Application Flow

```
1. Family registers account
   ↓
2. Start application (17 sections)
   ↓
3. Auto-save progress + email reminders
   ↓
4. Submit for review
   ↓
5. Three admin teams review
   ↓
6. All approve → Generate Stripe invoice
   ↓
7. Family pays invoice
   ↓
8. Application status: "Paid" ✅
```

## 🛠️ Development Workflow

### Phase 1: Setup (Do This First!)

1. **Prerequisites Check**
   ```bash
   node --version  # Should be 18+
   python3 --version  # Should be 3.11+
   git --version
   ```

2. **Create Accounts** (if you don't have them)
   - [Supabase](https://supabase.com) - Database and storage
   - [Stripe](https://stripe.com) - Payments (test mode is free)
   - [SendGrid](https://sendgrid.com) - Emails (free tier available)
   - [Google Cloud Console](https://console.cloud.google.com) - OAuth

3. **Follow SETUP.md**
   - Set up Supabase project
   - Run database migrations
   - Configure environment variables
   - Install dependencies

### Phase 2: Backend Development

**Start Here**: `backend/app/`

#### Recommended Order:

1. **Authentication** (`backend/app/api/auth.py`)
   ```python
   # Endpoints to implement:
   POST   /api/auth/register
   POST   /api/auth/login
   POST   /api/auth/google
   POST   /api/auth/logout
   POST   /api/auth/reset-password
   GET    /api/auth/me
   ```

2. **Database Models** (`backend/app/models/`)
   ```python
   # Create SQLAlchemy models for:
   - User
   - Application
   - ApplicationSection
   - ApplicationQuestion
   - ApplicationResponse
   - File
   - AdminNote
   - Invoice
   ```

3. **Application Endpoints** (`backend/app/api/applications.py`)
   ```python
   # Endpoints to implement:
   GET    /api/applications
   POST   /api/applications
   GET    /api/applications/{id}
   PATCH  /api/applications/{id}
   POST   /api/applications/{id}/submit
   ```

4. **Admin Endpoints** (`backend/app/api/admin.py`)
   ```python
   # Endpoints to implement:
   GET    /api/admin/applications
   POST   /api/admin/applications/{id}/approve
   POST   /api/admin/applications/{id}/notes
   ```

5. **Payments & Emails**
   - Stripe integration
   - SendGrid integration
   - Webhooks

### Phase 3: Frontend Development

**Start Here**: `frontend/app/`

#### Recommended Order:

1. **Auth Pages** (`frontend/app/(auth)/`)
   - Login page
   - Register page
   - Password reset

2. **User Dashboard** (`frontend/app/(dashboard)/`)
   - Dashboard layout
   - Application list
   - View application status

3. **Application Wizard** (`frontend/app/(dashboard)/application/`)
   - Multi-step form
   - Autosave
   - File uploads
   - Progress tracking

4. **Admin Dashboard** (`frontend/app/(admin)/`)
   - Application table
   - Review interface
   - Approval workflow

5. **Super Admin** (`frontend/app/(admin)/config/`)
   - Question builder
   - System settings

### Phase 4: Testing & Deployment

1. Write tests as you go
2. Follow [DEPLOYMENT.md](DEPLOYMENT.md) when ready

## 💡 Helpful Tips

### Backend Tips

```python
# Use FastAPI dependency injection
from app.core.deps import get_current_user

@router.get("/applications")
async def get_applications(
    current_user: User = Depends(get_current_user)
):
    # current_user is automatically validated from JWT
    pass

# Use Pydantic for validation
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
```

### Frontend Tips

```typescript
// Use the Supabase client for auth
import { createClientComponentClient } from '@supabase/supabase-js'

const supabase = createClientComponentClient()

// Fetch data with proper types
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications`)
const data: Application[] = await response.json()

// Use React Hook Form for forms
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
```

### Database Tips

```sql
-- Always use parameterized queries
-- SQLAlchemy handles this automatically

-- Test queries in Supabase SQL Editor first
SELECT * FROM applications
WHERE user_id = 'some-uuid'
ORDER BY created_at DESC;

-- Check indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public';
```

## 🐛 Common Issues & Solutions

### "Can't connect to database"
```bash
# Check your DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check Supabase project is running
```

### "OAuth not working"
```bash
# Verify redirect URIs match EXACTLY
# In Google Console: http://localhost:3000/auth/callback/google
# In your app: Same URL

# Check environment variables
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
```

### "Files not uploading"
```bash
# Check Supabase Storage bucket exists
# Bucket name: "application-files"
# Set bucket policies for authenticated users

# Check file size limit (10MB default)
```

### "Emails not sending"
```bash
# Verify SendGrid API key
# Check sender email is verified
# Look at email_logs table for errors
```

## 📖 Learning Resources

### FastAPI
- [Official Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Dependency Injection](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [Security](https://fastapi.tiangolo.com/tutorial/security/)

### Next.js
- [Learn Next.js](https://nextjs.org/learn)
- [App Router](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### Supabase
- [JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Auth](https://supabase.com/docs/guides/auth)
- [Storage](https://supabase.com/docs/guides/storage)

### Stripe
- [Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Invoices](https://stripe.com/docs/invoicing)
- [Webhooks](https://stripe.com/docs/webhooks)

## 🎯 Your First Task

**Goal**: Get the login page working

### Backend (30 minutes)
1. Create `backend/app/core/security.py` with JWT functions
2. Create `backend/app/api/auth.py` with `/login` endpoint
3. Test with curl or Postman

### Frontend (30 minutes)
1. Create `frontend/app/(auth)/login/page.tsx`
2. Add form with email and password
3. Call the login API
4. Store JWT token

### Test It
1. Start backend: `uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Go to `http://localhost:3000/login`
4. Try logging in with `admin@campfasd.org` / `ChangeMe123!`

## 📝 Development Checklist

Use this as you build features:

### For Each API Endpoint
- [ ] Create route in appropriate file
- [ ] Add authentication middleware if needed
- [ ] Validate inputs with Pydantic schema
- [ ] Handle errors gracefully
- [ ] Add logging
- [ ] Write docstring
- [ ] Test with example data
- [ ] Update API documentation

### For Each React Component
- [ ] Use TypeScript with proper types
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Add accessibility attributes
- [ ] Make mobile responsive
- [ ] Test keyboard navigation
- [ ] Add comments for complex logic

### For Each Database Query
- [ ] Use parameterized queries
- [ ] Add appropriate indexes
- [ ] Test with large datasets
- [ ] Consider RLS policies
- [ ] Add error handling

## 🤝 Getting Help

### Documentation
- Check [PROJECT_STATUS.md](PROJECT_STATUS.md) for what's implemented
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions
- See [SETUP.md](SETUP.md) for environment issues

### Code Examples
- Look at seed data for database structure examples
- Check configuration files for setup patterns
- Review migration files for SQL examples

### External Resources
- FastAPI Discord
- Next.js Discord
- Supabase Discord
- Stack Overflow

### Contact
- Technical questions: dev@campfasd.org
- Stuck on something? Create a GitHub issue

## 🚀 Next Steps

1. ✅ You're reading this (great start!)
2. ⏭️ Read [PROJECT_STATUS.md](PROJECT_STATUS.md)
3. ⏭️ Follow [SETUP.md](SETUP.md) to set up your environment
4. ⏭️ Start with backend authentication
5. ⏭️ Build the frontend login page
6. ⏭️ Follow the development workflow above

## 🎉 You're Ready!

You now have everything you need to start building the CAMP FASD Application Portal. The foundation is solid, the architecture is well-documented, and the path forward is clear.

**Remember**:
- Take it one feature at a time
- Test as you go
- Commit often
- Ask for help when stuck
- Have fun building something that will help families! 🏕️

---

**Happy Coding!** 💻✨
