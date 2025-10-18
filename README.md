# CAMP FASD Camper Application Portal

A modern, secure web application for managing camper applications for CAMP – A FASD Community.

## Overview

This application streamlines the camper registration process with role-based access for families, administrators, and super admins. It includes multi-step application forms, file management, payment processing, and comprehensive admin tools.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Styling**: TailwindCSS
- **State Management**: React Context + Hooks
- **Forms**: React Hook Form + Zod validation
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT + Supabase Auth
- **File Storage**: Supabase Storage
- **Payments**: Stripe
- **Email**: SendGrid
- **API Documentation**: OpenAPI/Swagger (auto-generated)

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Hosting**: TBD (Vercel for frontend, Railway/Render for backend)

## Brand Colors

- **Forest Green**: `#316429`
- **Orange**: `#e26e15`
- **White**: `#ffffff`
- **Charcoal**: `#202020`

## Project Structure

```
camp-fasd-app/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                # Utilities and configurations
│   ├── hooks/              # Custom React hooks
│   ├── styles/             # Global styles
│   └── public/             # Static assets
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configurations
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── migrations/         # Database migrations
│   └── tests/              # Backend tests
├── supabase/               # Supabase configurations
│   ├── migrations/         # SQL migrations
│   └── seed.sql           # Seed data
└── docs/                   # Documentation
```

## Key Features

### User Roles
- **User (Family)**: Submit and manage camper applications
- **Admin**: Review applications (Ops, Behavioral Health, Medical teams)
- **Super Admin**: Configure system settings, manage users, reset applications

### Application Flow
1. Family creates account and starts application
2. Multi-step wizard with autosave and progress tracking
3. File uploads for medical records, IEP, insurance, etc.
4. Automatic email reminders based on completion percentage
5. Admin teams review and approve/decline applications
6. Upon acceptance: Stripe invoice generated and sent
7. Payment confirmation triggers final status update

### Admin Dashboard
- View all applications with filtering by status, cabin assignment
- Review uploaded files and application details
- Leave internal notes visible to other admins
- Three-team approval workflow (Ops, Behavioral, Medical)
- Track returning vs new campers

### Super Admin Tools
- Dynamically add/edit application sections and questions
- Configure question types (text, dropdown, multiple choice, file upload)
- Mark questions as required or optional
- Set whether questions reset annually
- Manage email templates and triggers
- Configure Stripe invoice amounts
- Apply scholarships and discounts
- Manage admin-assignable options (cabins, etc.)
- Reset applications for new camp season

## Application Sections

1. Overview
2. Camper Information
3. Applicant Background
4. FASD Screener
5. Medical History
6. Medical Details (daily medications)
7. Insurance (file upload)
8. Healthcare Providers
9. IEP (file upload)
10. COVID-19 Acknowledgment (file upload)
11. Medical History Form (download & upload)
12. Immunizations (file upload)
13. Letter to My Counselor (download & upload)
14. Authorizations (e-signature)
15. Additional Camper Information
16. Emergency Contact Information
17. Authorization Release

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (via Supabase)
- Supabase account
- Stripe account
- SendGrid account

### Environment Variables

Create `.env.local` in the `frontend/` directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Create `.env` in the `backend/` directory:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
DATABASE_URL=your_postgres_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@campfasd.org
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

### Installation

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Database Setup

```bash
# Run migrations
cd supabase
supabase migration up

# Seed initial data (super admin, question templates)
psql $DATABASE_URL < seed.sql
```

## Development

### Running Tests
```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
pytest
```

### Code Style
- Frontend: ESLint + Prettier
- Backend: Black + isort + flake8

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Encrypted storage for sensitive fields
- File access control per user
- HTTPS only in production
- CSRF protection
- Rate limiting on API endpoints
- Input validation and sanitization

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Mobile-first responsive design

## Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Railway/Render)
```bash
# Configure environment variables in platform dashboard
# Push to main branch triggers deployment
```

## Future Enhancements (Stretch Features)

- Electronic Medical Record (EMR) for medication tracking
- "At CAMP Dashboard" with real-time camper information
- In-app chat between families and admins
- AI-assisted form filling based on previous year
- PDF export of completed applications

## Support

For issues or questions, contact: [support@campfasd.org](mailto:support@campfasd.org)

## License

Proprietary - CAMP – A FASD Community
