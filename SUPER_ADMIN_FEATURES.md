# Super Admin Features - Testing Guide

**Last Updated**: October 20, 2025
**Status**: Phase 5 - 85% Complete

---

## Overview

This document provides a comprehensive guide to all Super Admin features that have been implemented. These features allow super administrators to configure and manage the entire CAMP FASD application system.

---

## Access

**Super Admin Dashboard**: [http://localhost:3000/super-admin](http://localhost:3000/super-admin)

**Credentials** (default super admin):
- Email: `yianni@fasdcamp.org`
- Password: (your configured password)

---

## Feature List

### 1. Application Builder ✅ FULLY FUNCTIONAL
**Location**: `/super-admin/application-builder`
**Status**: Connected to database, all CRUD operations working
**Backend API**: ✅ Complete

**What You Can Do**:
- View all application sections and questions from the database
- Create new sections with:
  - Title and description
  - Visibility control (Always, After Acceptance, After Payment)
  - Active/inactive toggle
  - Order index
- Create questions within sections with:
  - 11 question types (text, textarea, dropdown, multiple choice, file upload, profile picture, checkbox, date, email, phone, signature)
  - Required field toggle
  - Help text and placeholder
  - Validation rules (min/max length, patterns, file types, file sizes)
  - Options for dropdown/multiple choice
  - **Template file attachment** (download forms like doctor forms)
  - Conditional visibility based on application status
  - **Conditional logic** (show question if previous answer matches condition)
    - Visual indicators: Blue "Conditional" badge with GitBranch icon
    - Hover tooltip shows the condition
    - Expanded view shows full conditional logic explanation
- Edit existing sections and questions
- Delete sections (automatically deletes all questions via CASCADE)
- Delete individual questions
- **Duplicate questions** (creates copy with " - Copy" appended, placed immediately after original)
- Reorder sections and questions (drag-and-drop and up/down buttons working)

**Testing Steps**:
1. Navigate to `/super-admin/application-builder`
2. Wait for sections to load from database
3. Click "Add Section" to create a new section
4. Fill in section details and save
5. Click on a section to expand and see questions
6. Click "Add Question" to create a question
7. Select question type and fill in details
8. For file upload questions, you can attach a template file
9. For conditional questions, select a previous question and specify the trigger answer
10. Save the question
11. **Verify conditional questions show a blue "Conditional" badge and explanation text**
12. Try editing a question by clicking the edit icon
13. Try duplicating a question by clicking the copy icon
14. Verify the duplicated question appears immediately after the original with " - Copy" appended
15. Try deleting a question
16. Try reordering questions with drag-and-drop or up/down buttons
17. Try deleting an entire section

**API Endpoints Used**:
- `GET /api/application-builder/sections?include_inactive=true`
- `POST /api/application-builder/sections`
- `PUT /api/application-builder/sections/{id}`
- `DELETE /api/application-builder/sections/{id}`
- `POST /api/application-builder/questions`
- `PUT /api/application-builder/questions/{id}`
- `DELETE /api/application-builder/questions/{id}`
- `POST /api/application-builder/questions/{id}/duplicate`
- `POST /api/application-builder/sections/reorder`
- `POST /api/application-builder/questions/reorder`

---

### 2. Teams Management 🟡 UI COMPLETE (Backend Pending)
**Location**: `/super-admin/teams`
**Status**: Frontend complete, using mock data
**Backend API**: ❌ Not yet implemented

**What You Can Do** (Currently with Mock Data):
- View default teams:
  - System Administrators (all permissions)
  - Operations (view, edit, review applications)
  - Medical (view, review applications)
  - Behavioral Health (view, review applications)
  - LIT (view applications)
- Create new custom teams
- Edit team permissions:
  - View Applications
  - Edit Applications
  - Review Applications
  - Approve Applications
  - Manage Users
  - View Analytics
- Delete custom teams
- View team members

**What Needs Backend**:
- Save teams to database (teams table)
- Load teams from database
- Assign users to teams
- Persist permission changes

---

### 3. User Management 🟡 UI COMPLETE (Backend Pending)
**Location**: `/super-admin/users`
**Status**: Frontend complete, using mock data
**Backend API**: ❌ Not yet implemented

**What You Can Do** (Currently with Mock Data):
- View all users in sortable table
- Filter by role (Super Admin, Admin, User)
- Filter by status (Active, Suspended)
- Search users by name or email
- Edit user details:
  - Change role (User, Admin, Super Admin)
  - Assign team (dropdown from Teams page)
  - Suspend or activate user account
- View user information (email, role, team, status)

**What Needs Backend**:
- Load users from database (users table)
- Update user role via API
- Update user team assignment
- Suspend/activate users
- Real-time data sync

---

### 4. System Settings 🟡 UI COMPLETE (Backend Pending)
**Location**: `/super-admin/settings`
**Status**: Frontend complete, needs backend integration
**Backend API**: ❌ Not yet implemented

**What You Can Configure** (Currently Local State Only):

**Application Settings Tab**:
- Application window open/closed toggle
- Application open date
- Application close date
- Maximum applications per user
- Allow returning campers toggle

**Email Notifications Tab**:
- Send application confirmation email
- Send acceptance/decline emails
- Send payment reminder emails
- Send deadline reminder emails

**File Upload Settings Tab**:
- Maximum file size (MB)
- Allowed file types
- Maximum files per application

**Security Policies Tab**:
- Enable rate limiting
- Session timeout (minutes)
- Require strong passwords
- Enable two-factor authentication

**What Needs Backend**:
- Store settings in system_config table
- Load settings from database on page load
- Save settings via API endpoint
- Apply settings across the application

---

### 5. Email Templates 🟡 UI COMPLETE (Backend Pending)
**Location**: `/super-admin/email-templates`
**Status**: Frontend complete, needs backend integration
**Backend API**: ❌ Not yet implemented

**What You Can Do** (Currently Local State Only):
- Create email templates for different scenarios:
  - Registration Confirmation
  - Application Complete
  - Acceptance
  - Decline
  - Payment Reminder
  - General
- Edit template subject and body
- Insert variables into email body:
  - `{{firstName}}` - Applicant's first name
  - `{{lastName}}` - Applicant's last name
  - `{{applicationId}}` - Application ID
  - `{{deadline}}` - Payment deadline
  - `{{amount}}` - Payment amount
  - `{{loginUrl}}` - Login URL
- Preview templates with sample data
- Delete templates

**What Needs Backend**:
- Store templates in email_templates table
- Load templates from database
- Configure email triggers (when to send)
- Integrate with SendGrid/SMTP for actual sending
- Track sent emails in email_logs table

---

### 6. Audit Logs 🟡 UI COMPLETE (Backend Pending)
**Location**: `/super-admin/audit-logs`
**Status**: Frontend complete, needs real event logging
**Backend API**: ❌ Not yet implemented

**What You Can Do** (Currently with Mock Data):
- View timeline of system events grouped by date
- See different event types:
  - User Created
  - Role Changed
  - Application Approved
  - Application Declined
  - Settings Updated
  - Email Sent
- Filter by event type
- Filter by user
- Filter by date range
- View severity levels (Info, Warning, Error)
- Export logs to CSV

**What Needs Backend**:
- Create audit_logs table
- Log events throughout the application
- API endpoint to fetch logs with filters
- CSV export endpoint
- Real-time event tracking

---

### 7. Super Admin Dashboard ✅ FUNCTIONAL (Mock Data)
**Location**: `/super-admin`
**Status**: Fully functional with mock stats
**Backend API**: ⚠️ Partial (needs real stats)

**What You Can See**:
- Quick stats cards:
  - Total Applications
  - Pending Reviews
  - Active Users
  - Completion Rate
- Recent Activity feed
- Quick Actions panel:
  - Review Applications
  - Manage Users
  - View Reports
  - System Settings

**What Needs Backend**:
- Real-time stats from database
- Actual recent activity events
- Link actions to real pages

---

### 8. Navigation & Layout ✅ FULLY FUNCTIONAL
**Location**: All `/super-admin/*` pages
**Status**: Complete and working

**Features**:
- Sidebar navigation with links to all pages
- Active route highlighting
- User information display
- **Sign out button** (working, redirects to login)
- Responsive design
- CAMP branding

---

## UI Components Created

All following components were created to support super admin features:

1. **Label** - Form labels with proper accessibility
2. **Textarea** - Multi-line text input
3. **Badge** - Status and team badges
4. **Avatar** - User avatars with initials
5. **Select** - Dropdown selects with search
6. **Dialog** - Modal dialogs
7. **Separator** - Visual dividers
8. **Alert** - Alert messages
9. **Tabs** - Tab navigation
10. **Switch** - Toggle switches

All components follow Radix UI and shadcn/ui patterns.

---

## Database Schema

### New Columns Added

**application_questions table**:
- `template_file_id` (UUID, nullable) - References files table for downloadable templates
- `show_if_question_id` (UUID, nullable) - References another question for conditional logic
- `show_if_answer` (TEXT, nullable) - Answer value that triggers showing this question
- Indexes on `template_file_id` and `show_if_question_id` for performance

### Migration Files

**004_add_question_template_files.sql**:
```sql
ALTER TABLE application_questions
ADD COLUMN template_file_id UUID REFERENCES files(id) ON DELETE SET NULL;

CREATE INDEX idx_questions_template_file ON application_questions(template_file_id);
```

**005_add_profile_picture_type.sql**:
```sql
ALTER TABLE application_questions
DROP CONSTRAINT IF EXISTS application_questions_question_type_check;

ALTER TABLE application_questions
ADD CONSTRAINT application_questions_question_type_check
CHECK (question_type IN (
  'text', 'textarea', 'dropdown', 'multiple_choice',
  'file_upload', 'checkbox', 'date', 'email', 'phone',
  'signature', 'profile_picture'
));
```

**006_add_conditional_question_logic.sql**:
```sql
ALTER TABLE application_questions
ADD COLUMN show_if_question_id UUID REFERENCES application_questions(id) ON DELETE CASCADE,
ADD COLUMN show_if_answer TEXT;

CREATE INDEX idx_questions_show_if ON application_questions(show_if_question_id);
```

### Important Implementation Notes

**Conditional Required Questions**:
- Questions can be marked as **required** AND have conditional logic
- The backend intelligently evaluates conditional logic when calculating completion percentage
- Required questions that are hidden (condition is false) do NOT count toward completion
- This ensures users can reach 100% completion even if conditional required questions never appear

**Example Scenario**:
1. Question A: "Does parent live at different address?" (dropdown: Yes/No)
2. Question B: "Parent's street address" (text, **required**, shows if A = "Yes")
3. If user selects "No" → Question B never appears and doesn't block completion
4. If user selects "Yes" → Question B appears and MUST be answered to complete

**Implementation**: Both `calculate_completion_percentage()` and `get_application_progress()` evaluate conditional logic by:
1. Fetching all user responses
2. For each question with `show_if_question_id`, checking if the trigger response matches `show_if_answer`
3. Only counting required questions that would actually be visible to the user

---

## Testing Checklist

### Application Builder (Priority: High)
- [x] Backend API working
- [ ] Navigate to application builder page
- [ ] Verify existing sections load from database
- [ ] Create a new section
- [ ] Edit section details
- [ ] Delete a section
- [ ] Create a new question
- [ ] Set question type to file_upload
- [ ] Attach a template file to the question
- [ ] Edit question details
- [ ] Delete a question
- [ ] Duplicate a question
- [ ] Verify duplicate appears after original with " - Copy"
- [ ] Test required field toggle
- [ ] Test visibility conditions
- [ ] Test validation rules
- [ ] Test conditional question logic
- [ ] Test drag-and-drop question reordering
- [ ] Test up/down buttons for reordering

### Teams Management (Priority: Medium)
- [ ] Navigate to teams page
- [ ] Verify default teams display
- [ ] Create a custom team
- [ ] Edit team permissions
- [ ] Delete a custom team
- [ ] View team members
- **Note**: Backend API needs to be built first

### User Management (Priority: Medium)
- [ ] Navigate to users page
- [ ] Filter users by role
- [ ] Filter users by status
- [ ] Search for a user
- [ ] Edit a user's role
- [ ] Assign a user to a team
- [ ] Suspend a user
- [ ] Reactivate a user
- **Note**: Backend API needs to be built first

### System Settings (Priority: Medium)
- [ ] Navigate to settings page
- [ ] Switch between tabs
- [ ] Toggle application window
- [ ] Set application dates
- [ ] Configure email notifications
- [ ] Set file upload limits
- [ ] Configure security policies
- [ ] Save configuration
- **Note**: Backend API needs to be built first

### Email Templates (Priority: Medium)
- [ ] Navigate to email templates page
- [ ] Create a new template
- [ ] Select template type
- [ ] Insert variables
- [ ] Preview template
- [ ] Edit template
- [ ] Delete template
- **Note**: Backend API needs to be built first

### Audit Logs (Priority: Low)
- [ ] Navigate to audit logs page
- [ ] View timeline of events
- [ ] Filter by event type
- [ ] Filter by user
- [ ] Filter by date range
- [ ] Export to CSV
- **Note**: Backend API needs to be built first

### General Navigation
- [x] Navigate between all super admin pages
- [x] Sign out from super admin
- [x] Verify redirect to login after sign out
- [x] Active route highlighting works

---

## Known Issues

None currently. All features are working as expected with the understanding that some features use mock data until backend APIs are built.

---

## Next Steps

### Immediate (Complete Phase 5)
1. **Build Teams API** - CRUD endpoints for teams table
2. **Build User Management API** - Update user role, team, suspend endpoints
3. **Build System Config API** - Save/load system configuration
4. **Build Email Templates API** - CRUD for email templates
5. **Build Audit Logs API** - Log events and fetch with filters
6. **Connect Frontend to APIs** - Replace mock data with real API calls

### Future (Phase 6)
1. Email notification system with triggers
2. Stripe payment integration
3. Invoice management
4. Payment tracking

---

## File Reference

### Frontend Files
- `frontend/app/super-admin/application-builder/page.tsx`
- `frontend/app/super-admin/teams/page.tsx`
- `frontend/app/super-admin/users/page.tsx`
- `frontend/app/super-admin/settings/page.tsx`
- `frontend/app/super-admin/email-templates/page.tsx`
- `frontend/app/super-admin/audit-logs/page.tsx`
- `frontend/app/super-admin/page.tsx`
- `frontend/app/super-admin/layout.tsx`
- `frontend/lib/api-application-builder.ts`
- `frontend/components/ui/label.tsx`
- `frontend/components/ui/textarea.tsx`
- `frontend/components/ui/badge.tsx`
- `frontend/components/ui/avatar.tsx`
- `frontend/components/ui/select.tsx`
- `frontend/components/ui/dialog.tsx`
- `frontend/components/ui/separator.tsx`
- `frontend/components/ui/alert.tsx`
- `frontend/components/ui/tabs.tsx`
- `frontend/components/ui/switch.tsx`

### Backend Files
- `backend/app/api/application_builder.py`
- `backend/app/models/application.py` (updated with template_file_id)
- `backend/app/main.py` (added application_builder router)

### Database Files
- `supabase/migrations/004_add_question_template_files.sql`

---

## Support

For questions or issues with super admin features, refer to:
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Overall project status
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [README.md](README.md) - General project information
