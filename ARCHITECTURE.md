# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Pages     │  │  Components  │  │  State Mgmt      │   │
│  │  (Routes)   │  │  (UI/Logic)  │  │  (Context/Hooks) │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│         │                  │                   │             │
│         └──────────────────┴───────────────────┘             │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │ HTTPS/REST
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                           ▼                                  │
│                  API Gateway (FastAPI)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Authentication Middleware                  │   │
│  │        (JWT Validation, Role Checking)               │   │
│  └─────────────────────────────────────────────────────┘   │
│           │              │              │                   │
│   ┌───────▼─────┐  ┌────▼─────┐  ┌────▼──────┐            │
│   │   Auth      │  │  App     │  │   Admin   │            │
│   │  Service    │  │ Service  │  │  Service  │            │
│   └─────────────┘  └──────────┘  └───────────┘            │
└───────────────────────────┬──────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
    ┌──────────────┐ ┌───────────┐ ┌──────────┐
    │   Supabase   │ │  Stripe   │ │ SendGrid │
    │  (Postgres   │ │ (Payments)│ │ (Email)  │
    │  + Storage)  │ │           │ │          │
    └──────────────┘ └───────────┘ └──────────┘
```

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin', 'super_admin'
    google_id VARCHAR(255) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE
);
```

#### applications
```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    camper_first_name VARCHAR(100),
    camper_last_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'in_progress',
    -- 'in_progress', 'under_review', 'accepted', 'declined', 'paid'
    completion_percentage INTEGER DEFAULT 0,
    is_returning_camper BOOLEAN DEFAULT FALSE,
    cabin_assignment VARCHAR(50),
    application_data JSONB, -- Stores all form responses
    ops_approved BOOLEAN DEFAULT FALSE,
    behavioral_approved BOOLEAN DEFAULT FALSE,
    medical_approved BOOLEAN DEFAULT FALSE,
    ops_approved_by UUID REFERENCES users(id),
    behavioral_approved_by UUID REFERENCES users(id),
    medical_approved_by UUID REFERENCES users(id),
    ops_approved_at TIMESTAMP,
    behavioral_approved_at TIMESTAMP,
    medical_approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    submitted_at TIMESTAMP,
    accepted_at TIMESTAMP,
    declined_at TIMESTAMP
);
```

#### application_sections
```sql
CREATE TABLE application_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    visible_before_acceptance BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### application_questions
```sql
CREATE TABLE application_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES application_sections(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    -- 'text', 'textarea', 'dropdown', 'multiple_choice', 'file_upload',
    -- 'checkbox', 'date', 'email', 'phone', 'signature'
    options JSONB, -- For dropdown/multiple choice options
    is_required BOOLEAN DEFAULT FALSE,
    reset_annually BOOLEAN DEFAULT FALSE, -- Whether to clear for new season
    order_index INTEGER NOT NULL,
    validation_rules JSONB, -- Additional validation (min/max length, patterns)
    help_text TEXT,
    placeholder TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### application_responses
```sql
CREATE TABLE application_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    question_id UUID REFERENCES application_questions(id) ON DELETE CASCADE,
    response_value TEXT,
    file_id UUID REFERENCES files(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(application_id, question_id)
);
```

#### files
```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    storage_path VARCHAR(500) NOT NULL, -- Path in Supabase Storage
    section VARCHAR(100), -- Which section it belongs to
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### admin_notes
```sql
CREATE TABLE admin_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES users(id),
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### invoices
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    stripe_invoice_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    scholarship_applied BOOLEAN DEFAULT FALSE,
    scholarship_note TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'open', 'paid', 'void'
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### system_config
```sql
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### email_templates
```sql
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables JSONB, -- Available template variables
    trigger_event VARCHAR(100), -- What triggers this email
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### assignable_options
```sql
CREATE TABLE assignable_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_type VARCHAR(100) NOT NULL, -- 'cabin', 'dietary_restriction', etc.
    option_value VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(option_type, option_value)
);
```

#### email_logs
```sql
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    template_used VARCHAR(100),
    sent_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50), -- 'sent', 'failed', 'bounced'
    error_message TEXT
);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/logout` - Logout
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/verify-email` - Verify email address
- `GET /api/auth/me` - Get current user

### Applications (User)
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Create new application
- `GET /api/applications/{id}` - Get application details
- `PATCH /api/applications/{id}` - Update application (autosave)
- `POST /api/applications/{id}/submit` - Submit for review
- `GET /api/applications/{id}/progress` - Get completion percentage
- `POST /api/applications/{id}/files` - Upload file
- `GET /api/applications/{id}/files/{file_id}` - Download file
- `DELETE /api/applications/{id}/files/{file_id}` - Delete file

### Applications (Admin)
- `GET /api/admin/applications` - List all applications (with filters)
- `GET /api/admin/applications/{id}` - View application details
- `POST /api/admin/applications/{id}/approve` - Approve (by team)
- `POST /api/admin/applications/{id}/decline` - Decline application
- `POST /api/admin/applications/{id}/notes` - Add admin note
- `GET /api/admin/applications/{id}/notes` - Get admin notes
- `PATCH /api/admin/applications/{id}/cabin` - Assign cabin

### Invoices
- `GET /api/applications/{id}/invoice` - Get invoice details
- `POST /api/admin/applications/{id}/invoice` - Generate invoice
- `POST /api/webhooks/stripe` - Stripe webhook handler

### Super Admin - Application Builder
- `GET /api/application-builder/sections` - Get all sections with questions (with inactive filter)
- `POST /api/application-builder/sections` - Create section
- `PUT /api/application-builder/sections/{id}` - Update section
- `DELETE /api/application-builder/sections/{id}` - Delete section (CASCADE deletes questions)
- `POST /api/application-builder/sections/reorder` - Reorder sections by ID list
- `POST /api/application-builder/questions` - Create question
- `PUT /api/application-builder/questions/{id}` - Update question
- `DELETE /api/application-builder/questions/{id}` - Delete question
- `POST /api/application-builder/questions/reorder` - Reorder questions by ID list

### Super Admin - Teams & Users (Planned)
- `GET /api/super-admin/teams` - List teams
- `POST /api/super-admin/teams` - Create team
- `PUT /api/super-admin/teams/{id}` - Update team
- `DELETE /api/super-admin/teams/{id}` - Delete team
- `GET /api/super-admin/users` - List all users
- `PUT /api/super-admin/users/{id}` - Update user (role, team, status)
- `POST /api/super-admin/users/{id}/suspend` - Suspend user
- `POST /api/super-admin/users/{id}/activate` - Activate user

### Super Admin - Configuration (Planned)
- `GET /api/super-admin/config` - Get system config
- `PUT /api/super-admin/config` - Update system config
- `GET /api/super-admin/email-templates` - List email templates
- `POST /api/super-admin/email-templates` - Create template
- `PUT /api/super-admin/email-templates/{id}` - Update template
- `DELETE /api/super-admin/email-templates/{id}` - Delete template
- `GET /api/super-admin/audit-logs` - Get audit logs with filters
- `POST /api/super-admin/audit-logs/export` - Export logs to CSV

## State Management

### Frontend Context Structure

#### AuthContext
```typescript
{
  user: User | null,
  loading: boolean,
  login: (email, password) => Promise<void>,
  loginWithGoogle: () => Promise<void>,
  logout: () => Promise<void>,
  register: (userData) => Promise<void>
}
```

#### ApplicationContext
```typescript
{
  application: Application | null,
  sections: Section[],
  currentSection: number,
  loading: boolean,
  saveProgress: (data) => Promise<void>,
  nextSection: () => void,
  previousSection: () => void,
  submitApplication: () => Promise<void>,
  uploadFile: (file, section) => Promise<void>
}
```

#### AdminContext
```typescript
{
  applications: Application[],
  filters: FilterState,
  loading: boolean,
  fetchApplications: () => Promise<void>,
  approveApplication: (id, team) => Promise<void>,
  declineApplication: (id, reason) => Promise<void>,
  addNote: (id, note) => Promise<void>
}
```

## Security Architecture

### Authentication Flow
1. User submits credentials
2. Backend validates and generates JWT
3. JWT stored in httpOnly cookie
4. Each request includes JWT in Authorization header
5. Middleware validates JWT and extracts user/role
6. Role-based access enforced at route level

### File Access Control
- Files stored in Supabase Storage with private buckets
- Access validated through application ownership
- Pre-signed URLs generated for downloads
- Upload size limits enforced (10MB per file)

### Data Encryption
- Passwords hashed with bcrypt (cost factor 12)
- Sensitive fields encrypted at rest
- HTTPS enforced in production
- Database connections encrypted

## Email Notification Triggers

1. **Welcome Email** - On registration
2. **Email Verification** - After registration
3. **Application Started** - First save
4. **Progress Reminders** - 60%, 80% completion
5. **Application Submitted** - When user submits
6. **Under Review** - When admin starts review
7. **Accepted** - When all teams approve
8. **Invoice Generated** - With payment link
9. **Payment Received** - Confirmation
10. **Declined** - With feedback option

## Payment Flow

1. Application approved by all teams
2. System calls Stripe API to create invoice
3. Invoice amount fetched from system_config (with scholarship adjustments)
4. Email sent to family with payment link
5. Stripe webhook notifies backend on payment
6. Application status updated to "paid"
7. Confirmation email sent

## Performance Considerations

- Application data stored in JSONB for flexibility
- Indexes on frequently queried fields (status, user_id, email)
- File uploads limited to 10MB, streamed to storage
- API rate limiting: 100 requests/minute per user
- Database connection pooling
- Frontend lazy loading for large lists
- Image optimization for logos/assets

## Deployment Architecture

### Production
- Frontend: Vercel (edge network, auto-scaling)
- Backend: Railway or Render (containerized)
- Database: Supabase (managed Postgres)
- Storage: Supabase Storage (S3-compatible)
- CDN: Cloudflare or Vercel Edge

### CI/CD
- GitHub Actions for automated testing
- Branch protection on main
- Preview deployments for PRs
- Automated database migrations on deploy
