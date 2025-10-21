# CAMP FASD Application Portal - Super Admin Specification

**Date**: October 20, 2025
**Purpose**: Complete specification of super admin capabilities and controls

---

## 🎯 Super Admin Philosophy

The super admin (yianni@fasdcamp.org) has **complete system control** and acts as the system architect. They can:
- Manage all users and their permissions
- Configure the application structure (sections, questions)
- Modify system settings (fees, dates, email templates)
- Override any workflow state
- View all system data and analytics
- Audit all system activity

**Key Principle**: Super admin should be able to configure EVERYTHING without touching code or database directly.

---

## 👥 Super Admin Capabilities Matrix

### 1. User Management & Access Control

#### View All Users
**Current State**: ❌ Not Implemented
**Requirements**:
- Table view of ALL users (families, admins, super_admins)
- Columns:
  - Name (first + last)
  - Email
  - Role (with color-coded badges)
  - Team (for admins only)
  - Status (active/inactive/suspended)
  - Created date
  - Last login date
  - Applications count (for families)
- Filters:
  - By role (All, Families, Admins, Super Admins)
  - By status (All, Active, Inactive, Suspended)
  - By team (for admins)
- Search by name or email
- Sort by any column
- Pagination (50 per page)

#### Promote/Demote Users
**Current State**: ❌ Not Implemented
**Requirements**:
- Change role: family → admin → super_admin
- Change role: super_admin → admin → family
- When promoting to admin:
  - Modal opens to select team (ops, med, behavioral, lit)
  - Can select multiple teams or leave blank for no team
- When demoting from admin:
  - Team assignment is cleared
- Confirmation dialog for role changes
- Audit log entry created

#### Assign/Change Team
**Current State**: ❌ Not Implemented
**Requirements**:
- Only applicable to users with role = 'admin'
- Dropdown/multi-select for teams:
  - ops (Operations)
  - med (Medical)
  - behavioral (Behavioral)
  - lit (Literacy)
- Can assign multiple teams
- Can remove team assignments
- Real-time update on save

#### Suspend/Activate Users
**Current State**: ❌ Not Implemented
**Requirements**:
- Add `status` field to users table (active, inactive, suspended)
- Suspended users cannot log in
- Inactive users are soft-deleted
- Confirmation dialog with reason field
- Can reactivate suspended/inactive users
- Audit log entry created

#### Reset User Passwords
**Current State**: ❌ Not Implemented
**Requirements**:
- Generate temporary password
- Send password reset email to user
- Option to force password change on next login
- Confirmation dialog before reset

#### Delete Users
**Current State**: ❌ Not Implemented
**Requirements**:
- Soft delete (mark as deleted but retain data)
- Confirmation dialog with warning:
  - "Are you sure? This will anonymize all user data."
- For families: orphan their applications (keep applications but remove PII)
- For admins: remove from approval records but keep historical data
- Cannot delete super admins (only one exists)
- Audit log entry created

#### Impersonate Users
**Current State**: ❌ Not Implemented
**Requirements**:
- "Login As" button next to each user
- Logs super admin out and logs them in as selected user
- Banner at top: "⚠️ You are viewing as [user name] - Exit Impersonation"
- All actions are audited as impersonation
- "Exit Impersonation" button returns to super admin account
- Use case: Debug user-specific issues, test permissions

---

### 2. Application Structure Management

#### View All Sections
**Current State**: ✅ Sections exist, ❌ Management UI not built
**Requirements**:
- Table view of all application sections
- Columns:
  - Order (drag-to-reorder)
  - Title
  - Description (truncated)
  - Questions count
  - Conditional? (shows show_when_status if set)
  - Active? (toggle switch)
  - Actions (Edit, Delete, Duplicate)
- Drag-and-drop to reorder sections
- "Add Section" button at top

#### Create/Edit Sections
**Current State**: ❌ Not Implemented
**Requirements**:
- Modal form with fields:
  - Title (required)
  - Description (textarea, optional)
  - Order Index (auto-incremented, can override)
  - Is Active (checkbox, default true)
  - Visible Before Acceptance (checkbox, default true)
  - Show When Status (dropdown: None, Accepted, Paid)
- Save button
- Cancel button
- Validation: Title required
- On save: Redirect to section detail or stay on list

#### Delete Sections
**Current State**: ❌ Not Implemented
**Requirements**:
- Confirmation dialog:
  - "Are you sure? This will delete X questions and may affect Y applications."
- Soft delete (set is_active = false) vs hard delete option
- Cannot delete if questions have responses (warn user)
- Audit log entry created

#### Duplicate Sections
**Current State**: ❌ Not Implemented
**Requirements**:
- Creates copy of section with "(Copy)" appended to title
- Copies all questions within section
- Placed at end of section list (highest order_index + 1)
- All copies are set to is_active = false by default

---

#### View All Questions
**Current State**: ✅ Questions exist, ❌ Management UI not built
**Requirements**:
- Nested view under sections OR separate tab
- Columns:
  - Order (drag-to-reorder within section)
  - Question Text (truncated)
  - Type (badge with icon)
  - Required? (checkbox icon)
  - Active? (toggle switch)
  - Conditional? (shows show_when_status if set)
  - Reset Annually? (checkbox icon)
  - Actions (Edit, Delete, Duplicate, Move)
- Filter by section
- Filter by type
- "Add Question" button

#### Create/Edit Questions
**Current State**: ❌ Not Implemented
**Requirements**:
- Modal/page form with fields:
  - **Section** (dropdown, required)
  - **Question Text** (textarea, required)
  - **Question Type** (dropdown, required):
    - text
    - textarea
    - dropdown
    - multiple_choice
    - file_upload
    - checkbox
    - date
    - email
    - phone
    - signature
  - **Options** (conditional field, shows if type = dropdown or multiple_choice):
    - Array of strings
    - Add/remove option buttons
    - Drag to reorder
  - **Is Required** (checkbox, default false)
  - **Reset Annually** (checkbox, default false)
  - **Order Index** (auto-incremented, can override)
  - **Validation Rules** (JSON editor or form):
    - Min length
    - Max length
    - Pattern (regex)
    - Min value (for numbers)
    - Max value (for numbers)
  - **Help Text** (textarea, optional)
  - **Placeholder** (text, optional)
  - **Is Active** (checkbox, default true)
  - **Show When Status** (dropdown: None, Accepted, Paid)
- Real-time preview of question as configured
- Save button
- Cancel button
- Validation: Question text and section required

#### Delete Questions
**Current State**: ❌ Not Implemented
**Requirements**:
- Confirmation dialog:
  - "Are you sure? This question has X responses."
- Soft delete (set is_active = false) vs hard delete option
- Cannot hard delete if responses exist (warn user)
- Audit log entry created

#### Move Questions
**Current State**: ❌ Not Implemented
**Requirements**:
- Modal with dropdown: "Move to section: [section list]"
- Updates section_id and recalculates order_index
- Placed at end of target section

#### Bulk Actions
**Current State**: ❌ Not Implemented
**Requirements**:
- Select multiple questions via checkboxes
- Bulk actions dropdown:
  - Activate
  - Deactivate
  - Move to Section
  - Delete
  - Make Required
  - Make Optional
- Confirmation dialog before bulk action
- Progress indicator for large operations

---

### 3. System Configuration Management

#### Camp Settings
**Current State**: ❌ Not Implemented (hardcoded values)
**Requirements**:
- Create `system_configuration` table:
  - `key` (String, unique) - e.g., 'camp_fee', 'camp_year'
  - `value` (JSON) - flexible storage
  - `description` (Text)
  - `data_type` (String) - 'string', 'number', 'boolean', 'date', 'json'
  - `updated_at` (DateTime)
  - `updated_by` (UUID, FK to users)

**Configurable Settings**:
1. **Camp Fee**
   - Key: `camp_fee`
   - Type: number
   - Default: 500.00
   - Description: "Application fee charged upon acceptance (USD)"

2. **Camp Year**
   - Key: `camp_year`
   - Type: number
   - Default: 2025
   - Description: "Current camp season year"

3. **Application Season**
   - Key: `application_season_start`
   - Type: date
   - Default: 2025-01-01
   - Description: "Date when applications open"

   - Key: `application_season_end`
   - Type: date
   - Default: 2025-06-30
   - Description: "Date when applications close"

4. **Camp Dates**
   - Key: `camp_start_date`
   - Type: date
   - Default: 2025-07-15

   - Key: `camp_end_date`
   - Type: date
   - Default: 2025-07-22

5. **Max Campers**
   - Key: `max_campers`
   - Type: number
   - Default: 50
   - Description: "Maximum number of campers accepted per season"

6. **Auto-Submit Enabled**
   - Key: `auto_submit_enabled`
   - Type: boolean
   - Default: true
   - Description: "Automatically submit applications when 100% complete"

7. **Approval Required Count**
   - Key: `approval_required_count`
   - Type: number
   - Default: 3
   - Description: "Number of approvals needed to enable Accept button"

8. **File Upload Settings**
   - Key: `max_file_size_mb`
   - Type: number
   - Default: 10

   - Key: `allowed_file_types`
   - Type: json (array)
   - Default: [".pdf", ".docx", ".doc", ".jpg", ".jpeg", ".png"]

9. **Contact Information**
   - Key: `contact_email`
   - Type: string
   - Default: "info@fasdcamp.org"

   - Key: `contact_phone`
   - Type: string
   - Default: "(555) 123-4567"

   - Key: `contact_address`
   - Type: json (object)
   - Default: {"street": "...", "city": "...", "state": "...", "zip": "..."}

10. **Email Settings**
    - Key: `email_enabled`
    - Type: boolean
    - Default: true

    - Key: `email_from_name`
    - Type: string
    - Default: "CAMP FASD"

    - Key: `email_from_address`
    - Type: string
    - Default: "noreply@fasdcamp.org"

**UI Requirements**:
- Settings page with categorized sections
- Each setting shows:
  - Label
  - Description
  - Input field (type-appropriate)
  - Save button (individual or "Save All")
- Validation per data type
- Audit log of all changes (who changed what, when)

---

### 4. Email Template Management

#### View All Templates
**Current State**: ❌ Not Implemented
**Requirements**:
- Create `email_templates` table:
  - `id` (UUID)
  - `key` (String, unique) - e.g., 'application_submitted'
  - `name` (String) - Human-readable name
  - `subject` (String) - Email subject line with variable support
  - `html_content` (Text) - HTML email body
  - `text_content` (Text) - Plain text fallback
  - `variables` (JSON array) - List of available variables
  - `is_active` (Boolean)
  - `updated_at` (DateTime)
  - `updated_by` (UUID, FK to users)

**Default Templates**:
1. **Application Submitted**
   - Key: `application_submitted`
   - Sent to: Family
   - Trigger: Application reaches 100%, status → under_review
   - Variables: `{family_name}`, `{camper_name}`, `{application_id}`, `{submission_date}`

2. **Application Accepted**
   - Key: `application_accepted`
   - Sent to: Family
   - Trigger: Admin clicks Accept button
   - Variables: `{family_name}`, `{camper_name}`, `{camp_year}`, `{dashboard_url}`, `{payment_amount}`

3. **Payment Received**
   - Key: `payment_received`
   - Sent to: Family
   - Trigger: Stripe webhook confirms payment
   - Variables: `{family_name}`, `{camper_name}`, `{payment_amount}`, `{transaction_id}`, `{receipt_url}`

4. **Admin: New Application**
   - Key: `admin_new_application`
   - Sent to: All admins
   - Trigger: Application submitted
   - Variables: `{camper_name}`, `{family_name}`, `{family_email}`, `{review_url}`, `{admin_name}`

5. **Admin: Ready to Accept**
   - Key: `admin_ready_to_accept`
   - Sent to: Super admins only
   - Trigger: Application reaches 3 approvals
   - Variables: `{camper_name}`, `{family_name}`, `{approved_teams}`, `{review_url}`

6. **Password Reset**
   - Key: `password_reset`
   - Sent to: Any user
   - Trigger: User requests password reset
   - Variables: `{user_name}`, `{reset_url}`, `{reset_token}`, `{expires_at}`

7. **Welcome New User**
   - Key: `welcome_new_user`
   - Sent to: New registrations
   - Trigger: User completes registration
   - Variables: `{user_name}`, `{email}`, `{dashboard_url}`

**UI Requirements**:
- List view with template cards
- Each card shows:
  - Template name
  - Key (read-only)
  - Last updated
  - Active toggle
  - Edit button
  - Preview button
  - Test Send button
- Click to edit opens rich text editor
- Variable picker dropdown (inserts `{variable_name}` at cursor)
- Live preview pane showing rendered HTML
- Test send form:
  - Recipient email input
  - Test data for variables
  - Send button
- Version history (optional, advanced)

#### Email Template Editor
**Current State**: ❌ Not Implemented
**Requirements**:
- Rich text editor (e.g., TinyMCE, Quill, or code editor with syntax highlighting)
- Split view: HTML code on left, preview on right
- Variable picker sidebar:
  - Shows all available variables for this template
  - Click to insert at cursor position
- Subject line editor (with variable support)
- Plain text auto-generator (strip HTML tags)
- Save draft vs Publish
- Revert to default button
- Validation:
  - Subject required
  - HTML content required
  - Validate all used variables are in the allowed list

---

### 5. Application & Workflow Management

#### Manual Status Override
**Current State**: ❌ Not Implemented
**Requirements**:
- On any application detail page (admin view)
- "Override Status" button (only visible to super admin)
- Modal with:
  - Current status (read-only display)
  - New status (dropdown):
    - in_progress
    - under_review
    - accepted
    - declined
    - paid
  - Reason (textarea, required)
  - Confirmation checkbox: "I understand this bypasses the normal workflow"
- On save:
  - Updates status
  - Recalculates progress if needed
  - Creates audit log entry with reason
  - Does NOT send automatic emails (manual action)
  - Shows success message

#### Bulk Application Actions
**Current State**: ❌ Not Implemented
**Requirements**:
- From admin applications list page
- Select multiple applications (checkboxes)
- Bulk actions dropdown:
  - **Accept Selected** (requires all have 3+ approvals)
  - **Decline Selected**
  - **Reset to In Progress** (force reopen)
  - **Delete Selected** (soft delete)
  - **Export Selected** (CSV/PDF)
- Confirmation dialog before action
- Progress bar for multi-application operations
- Summary report after completion:
  - "X applications updated successfully"
  - "Y applications failed: [reasons]"

#### Application Timeline/Audit Log
**Current State**: ❌ Not Implemented
**Requirements**:
- Create `audit_logs` table:
  - `id` (UUID)
  - `entity_type` (String) - 'application', 'user', 'section', 'question', 'configuration'
  - `entity_id` (UUID)
  - `action` (String) - 'created', 'updated', 'deleted', 'status_changed', etc.
  - `actor_id` (UUID, FK to users) - Who did it
  - `details` (JSON) - Old values, new values, reason, etc.
  - `ip_address` (String)
  - `user_agent` (String)
  - `created_at` (DateTime)

**UI Requirements**:
- Timeline view on application detail page
- Shows all events:
  - Application created
  - Responses saved (grouped by date)
  - Files uploaded
  - Application submitted
  - Approvals added
  - Status changes
  - Admin notes added
  - Payments made
- Each event shows:
  - Icon (based on event type)
  - Date/time
  - Actor (user who did it)
  - Description
  - Details (expandable)
- Filter by event type
- Export timeline as PDF

---

### 6. Team Management

#### View All Teams
**Current State**: ❌ Not Implemented (hardcoded)
**Requirements**:
- Currently teams are hardcoded: ops, med, behavioral, lit
- Make teams configurable in database
- Create `teams` table:
  - `id` (UUID)
  - `key` (String, unique) - e.g., 'med'
  - `name` (String) - e.g., 'Medical'
  - `description` (Text)
  - `color` (String) - hex color for badges
  - `is_active` (Boolean)
  - `created_at` (DateTime)

**Default Teams**:
- ops (Operations, #3B82F6 blue)
- med (Medical, #10B981 green)
- behavioral (Behavioral, #8B5CF6 purple)
- lit (Literacy, #F59E0B amber)

**UI Requirements**:
- Table view of teams
- Add team button
- Edit/delete for each team
- Drag to reorder (if order matters)
- Shows admin count per team
- Cannot delete team with assigned admins (warn and offer reassignment)

#### Assign Admins to Teams
**Current State**: ✅ Works, ❌ No UI for super admin to manage
**Requirements**:
- From user management page
- Edit user modal shows team selector (for admins)
- Multi-select dropdown
- Save updates `users.team` field
- Super admin can see all teams and manage assignments

---

### 7. Payment & Invoice Management

#### View All Payments
**Current State**: ❌ Not Implemented (no payment system yet)
**Requirements**:
- Separate "Payments" section in super admin dashboard
- Table view of all payments:
  - Application ID
  - Camper name
  - Family name
  - Amount
  - Status (pending, completed, failed, refunded)
  - Payment date
  - Transaction ID
  - Actions (View Receipt, Refund)
- Filters:
  - By status
  - By date range
  - By amount range
- Search by camper/family name or transaction ID
- Export to CSV
- Total revenue summary at top

#### Issue Refunds
**Current State**: ❌ Not Implemented
**Requirements**:
- "Refund" button on payment detail
- Modal with:
  - Payment amount (read-only)
  - Refund amount (input, defaults to full amount, can be partial)
  - Reason (textarea, required)
  - Confirmation checkbox
- On confirm:
  - Calls Stripe refund API
  - Updates payment status
  - Sends refund confirmation email to family
  - Creates audit log
  - Optionally changes application status back to 'accepted'

#### Manual Payment Entry
**Current State**: ❌ Not Implemented
**Requirements**:
- "Record Manual Payment" button
- Use case: Cash/check payments, offline transactions
- Modal with:
  - Application selector (dropdown/search)
  - Amount (input)
  - Payment method (dropdown: Cash, Check, Wire Transfer, Other)
  - Payment date (date picker)
  - Reference number (text)
  - Notes (textarea)
- On save:
  - Creates payment record with method = 'manual'
  - Updates application status to 'paid'
  - Sends payment confirmation email
  - Creates audit log

---

### 8. Reporting & Analytics

#### Dashboard Overview
**Current State**: ❌ Not Implemented
**Requirements**:
- Super admin homepage shows comprehensive stats:

  **Applications Section**:
  - Total applications (all time)
  - This season's applications
  - By status (pie chart):
    - In Progress: X (Y%)
    - Under Review: X (Y%)
    - Accepted: X (Y%)
    - Paid: X (Y%)
    - Declined: X (Y%)
  - Average completion time (days from start to submit)
  - Average review time (days from submit to accept)

  **Users Section**:
  - Total users
  - Families: X
  - Admins: X
  - Super Admins: X
  - New users this week: X

  **Payments Section**:
  - Total revenue (all time)
  - This season's revenue
  - Outstanding payments: X applications accepted but not paid
  - Refunded amount
  - Average payment time (days from accept to pay)

  **Team Performance**:
  - Table showing each team:
    - Team name
    - Admins count
    - Applications reviewed (count)
    - Average review time per application
    - Approval rate (approved / total reviewed)

  **Recent Activity**:
  - Last 10 significant events:
    - New applications submitted
    - Applications accepted
    - Payments received
    - New users registered
    - Admin approvals given

#### Application Reports
**Current State**: ❌ Not Implemented
**Requirements**:
- Reports page with filters:
  - Date range selector
  - Status filter
  - Team filter
- Report types:
  1. **Applications Summary**
     - Total count by status
     - Conversion funnel (started → submitted → accepted → paid)
     - Drop-off analysis (where users abandon)

  2. **Demographic Report**
     - Camper age distribution
     - Geographic distribution (if collected)
     - Returning vs new campers

  3. **Team Performance Report**
     - Approvals per team
     - Average time to approve
     - Individual admin performance

  4. **Financial Report**
     - Revenue by payment method
     - Refunds issued
     - Outstanding payments
     - Revenue forecast (accepted but not paid)

  5. **Completion Analysis**
     - Which sections take longest to complete
     - Which questions are most often skipped
     - File upload statistics
- Export all reports as:
  - PDF (formatted report)
  - CSV (raw data)
  - Excel (with charts)

#### Question Analytics
**Current State**: ❌ Not Implemented
**Requirements**:
- For each question, show:
  - Response rate (% of applications that answered)
  - Average time spent on question
  - Most common answers (for dropdowns/multiple choice)
  - Skip rate
  - Edit rate (how often users change their answer)
- Use case: Identify confusing questions, optimize application flow

---

### 9. System Maintenance

#### Database Backup/Restore
**Current State**: ❌ Not Implemented (relies on Supabase auto-backups)
**Requirements**:
- "Backup Database" button
- Triggers Supabase backup via API
- Shows last backup date/time
- Download backup file option
- "Restore from Backup" option (with warning)
- Scheduled automatic backups (daily at 2 AM)

#### View System Logs
**Current State**: ❌ Not Implemented
**Requirements**:
- Access to backend application logs
- Filters:
  - Log level (info, warning, error, critical)
  - Date range
  - Search by message
- Real-time log streaming option
- Download logs as .txt file
- Clear logs button (archives to storage)

#### Maintenance Mode
**Current State**: ❌ Not Implemented
**Requirements**:
- Toggle switch: "Enable Maintenance Mode"
- When enabled:
  - All non-super-admin users see "System Under Maintenance" page
  - Custom message field (textarea)
  - Estimated return time (datetime picker)
  - Super admins can still access everything
- Use case: Major updates, data migrations, emergency fixes

#### Clear Cache
**Current State**: ❌ Not Implemented (no caching yet)
**Requirements**:
- "Clear Cache" button
- Clears:
  - Application response cache
  - Section/question cache
  - User session cache
  - File metadata cache
- Shows success message with cache size freed
- Use case: Debugging, after configuration changes

---

### 10. Security & Audit

#### View All Sessions
**Current State**: ❌ Not Implemented
**Requirements**:
- Table of active user sessions:
  - User name
  - Email
  - Role
  - IP address
  - Location (from IP)
  - Browser/device
  - Login time
  - Last activity time
  - Session duration
- "Terminate Session" button for each
- "Terminate All Sessions" for a user
- Use case: Security breach, suspicious activity

#### Two-Factor Authentication
**Current State**: ❌ Not Implemented
**Requirements**:
- Super admin can enforce 2FA for:
  - All admins (checkbox)
  - All super admins (checkbox, recommended)
  - Families (checkbox, optional)
- Users with 2FA enabled see QR code setup
- Backup codes generated
- Super admin can reset 2FA for users who lose access

#### IP Whitelist (Optional, Advanced)
**Current State**: ❌ Not Implemented
**Requirements**:
- List of allowed IP addresses/ranges
- Add/remove IP addresses
- Apply to:
  - Admin logins only
  - Super admin logins only
  - All logins
- Bypass option for specific users
- Use case: Restrict admin access to office network

#### Security Audit Log
**Current State**: ❌ Not Implemented
**Requirements**:
- Filtered view of audit_logs table showing security events:
  - Failed login attempts
  - Password changes
  - Role changes
  - Permission changes
  - Session terminations
  - IP address changes
  - 2FA enabled/disabled
- Export as CSV
- Alert on suspicious patterns (e.g., 10 failed logins in 5 minutes)

---

## 🏗️ Super Admin Dashboard Structure

### Navigation Menu

```
Super Admin Dashboard
├── 🏠 Overview (stats and recent activity)
├── 👥 User Management
│   ├── All Users (table)
│   ├── Families
│   ├── Admins
│   ├── Super Admins
│   └── Sessions
├── 📋 Applications
│   ├── All Applications (inherited from regular admin)
│   ├── Bulk Actions
│   └── Application Reports
├── 📝 Application Structure
│   ├── Sections (list with CRUD)
│   ├── Questions (list with CRUD)
│   └── Question Builder (drag-drop interface)
├── 👥 Teams
│   ├── Team List (CRUD)
│   └── Team Assignments
├── ⚙️ System Configuration
│   ├── Camp Settings
│   ├── File Upload Settings
│   ├── Email Settings
│   └── Workflow Settings
├── ✉️ Email Templates
│   ├── Template List
│   └── Template Editor
├── 💰 Payments & Invoices
│   ├── All Payments
│   ├── Issue Refunds
│   ├── Manual Payments
│   └── Financial Reports
├── 📊 Reports & Analytics
│   ├── Dashboard (charts and graphs)
│   ├── Application Reports
│   ├── Team Performance
│   ├── Financial Reports
│   └── Question Analytics
├── 🔒 Security & Audit
│   ├── Audit Logs
│   ├── Security Events
│   ├── Active Sessions
│   └── 2FA Management
└── 🔧 System Maintenance
    ├── Database Backups
    ├── System Logs
    ├── Maintenance Mode
    └── Cache Management
```

---

## 📋 Implementation Priority

### Phase 1: Foundation (Most Critical)
**Time Estimate: 8-12 hours**

1. **Super Admin Dashboard Layout**
   - Create main dashboard page
   - Build navigation menu
   - Add overview stats section
   - Ensure only super admin can access

2. **User Management**
   - All users table view
   - Promote/demote functionality
   - Team assignment
   - Role changes
   - Basic audit logging

3. **System Configuration**
   - Create system_configuration table
   - Build settings UI
   - Implement camp settings (fee, year, dates)
   - File upload settings
   - Workflow settings (approval count, auto-submit)

### Phase 2: Application Control (High Priority)
**Time Estimate: 10-15 hours**

4. **Section Management**
   - View all sections
   - Create/edit sections
   - Reorder sections (drag-drop)
   - Delete/deactivate sections
   - Duplicate sections

5. **Question Management**
   - View all questions
   - Create/edit questions (full form)
   - Question type selector with conditional fields
   - Options editor (for dropdowns)
   - Move questions between sections
   - Bulk actions

6. **Manual Status Override**
   - Override button on application detail
   - Reason tracking
   - Audit logging

### Phase 3: Communication & Teams (Medium Priority)
**Time Estimate: 6-8 hours**

7. **Email Template Management**
   - Create email_templates table
   - Template list view
   - Template editor with preview
   - Variable picker
   - Test send functionality

8. **Team Management**
   - Create teams table
   - Team CRUD interface
   - Team assignment UI

### Phase 4: Reporting & Analytics (Medium Priority)
**Time Estimate: 8-10 hours**

9. **Dashboard Analytics**
   - Application stats cards
   - Charts (pie, line, bar)
   - Team performance table
   - Recent activity feed

10. **Application Reports**
    - Report builder with filters
    - Export functionality (CSV, PDF)
    - Demographic analysis
    - Completion analysis

### Phase 5: Advanced Features (Lower Priority)
**Time Estimate: 8-12 hours**

11. **Payment Management**
    - Payments list
    - Refund functionality
    - Manual payment entry
    - Financial reports

12. **Security Features**
    - Complete audit log viewer
    - Session management
    - 2FA enforcement
    - Security event monitoring

13. **System Maintenance**
    - Maintenance mode toggle
    - System logs viewer
    - Cache management
    - Backup controls

---

## 🎯 Success Criteria

Super admin functionality is complete when:
- ✅ Super admin can manage all users without database access
- ✅ Super admin can configure entire application structure without code changes
- ✅ Super admin can modify all system settings from UI
- ✅ Super admin can create/edit all email templates
- ✅ Super admin has visibility into all system activity via audit logs
- ✅ Super admin can generate all necessary reports
- ✅ Super admin can perform emergency actions (status override, session termination)
- ✅ Super admin dashboard is intuitive and requires no training

---

## 🚀 Recommended Starting Point

**START HERE**: Phase 1, Item 1-3
1. Build super admin dashboard layout with navigation
2. Implement user management (view, edit roles, assign teams)
3. Implement system configuration (settings page)

**Why this order?**
- User management gives immediate control over access
- System configuration enables customization without code changes
- These two provide the most value with reasonable effort
- Everything else builds on this foundation

Once these are done, you'll have:
- Full control over who has access and their permissions
- Ability to configure camp fee, dates, and workflow settings
- A solid foundation to build more advanced features

---

## 📊 Effort Estimate Summary

| Phase | Features | Estimated Hours | Complexity |
|-------|----------|----------------|------------|
| Phase 1 | Dashboard + Users + Config | 8-12 | Medium |
| Phase 2 | Sections + Questions + Override | 10-15 | High |
| Phase 3 | Email Templates + Teams | 6-8 | Medium |
| Phase 4 | Reports + Analytics | 8-10 | Medium-High |
| Phase 5 | Payments + Security + Maintenance | 8-12 | Medium-High |
| **TOTAL** | **Complete Super Admin** | **40-57 hours** | **High** |

---

## 💡 Quick Wins for Immediate Value

If you want to start with smaller pieces that provide immediate value:

1. **User Role Management (2-3 hours)**
   - Just the user table and promote/demote functionality
   - Gives you control without database access

2. **Camp Fee Configuration (1-2 hours)**
   - Single setting: camp fee amount
   - Unblocks payment implementation

3. **Manual Status Override (2-3 hours)**
   - Override button on application detail
   - Critical for handling edge cases

4. **Team Management (2-3 hours)**
   - Make teams configurable instead of hardcoded
   - Allows flexibility as organization changes

These 4 quick wins total **7-11 hours** and provide massive value.

---

Ready to start building? Let me know which phase you'd like to tackle first!
