# CAMP FASD Application Portal - Next Steps

**Date**: October 20, 2025
**Current Status**: Phase 4 - 60% Complete (Post-Acceptance Workflow)

---

## 🎉 What We Just Completed (This Session)

### Conditional Questions & Post-Acceptance Workflow
We successfully implemented a complete conditional questions system that allows sections and questions to appear based on application status. Here's what works now:

1. **Database Schema**
   - Added `show_when_status` column to both `application_sections` and `application_questions` tables
   - Created migration with check constraints for valid values ('accepted', 'paid', or NULL)
   - Added indexes for performance

2. **Backend Models & Logic**
   - Updated SQLAlchemy models to include `show_when_status` field
   - Updated Pydantic schemas for API validation
   - Modified `/api/applications/sections` endpoint to filter by application status
   - Modified `/api/applications/{id}/progress` endpoint to filter sections/questions
   - Updated `calculate_completion_percentage()` to only count visible questions

3. **Manual Acceptance Flow**
   - Removed auto-transition from approval endpoint
   - Created new `/api/admin/applications/{id}/accept` endpoint
   - Accept button only enabled when 3 approvals from 3 different teams
   - Admin must manually click Accept button
   - On accept: status changes, timestamp set, progress recalculates

4. **Post-Acceptance Section Created**
   - Section 18: "Post-Acceptance Information" with 5 questions
   - Only visible when application status = 'accepted'
   - Questions: travel arrangements, t-shirt size, dietary restrictions, special equipment, emergency phone
   - Progress drops from 100% to 91% when accepted (34/37 required questions answered)

5. **Family Dashboard Enhancements**
   - Green congratulations banner for accepted applications with incomplete sections
   - Lists new sections that appeared
   - "Complete Registration Now" button
   - Context-aware button text:
     - "Continue Application" (in_progress < 100%)
     - "Edit Application" (under_review or 100%)
     - "Continue Registration" (accepted < 100%)

6. **Admin Dashboard Updates**
   - Accept button wired with click handler
   - Confirmation dialog before accepting
   - Refreshes both filtered and unfiltered application lists after accept
   - Stats cards remain independent of table filters

7. **Test Admin Users Created**
   - medical@fasdcamp.org (Dr. Sarah Johnson, med team)
   - behavioral@fasdcamp.org (James Martinez, behavioral team)
   - literacy@fasdcamp.org (Maria Chen, lit team)
   - All use password: **Camp2024!**

---

## 🎯 Recommended Next Steps (In Priority Order)

### Option 1: Email Notification System 🔴 **RECOMMENDED FIRST**

**Why This Should Be Next:**
- Families need to know their application was accepted
- Without email, families don't know to check dashboard for new sections
- Admins need notifications when applications need review
- Critical for user experience and workflow completion

**What Needs to Be Built:**

#### 1. Email Infrastructure Setup
- **SendGrid Integration** (recommended) or SMTP setup
  - Backend: Add SendGrid API key to `.env`
  - Install SendGrid Python SDK: `pip install sendgrid`
  - Create email service: `backend/app/services/email_service.py`
  - Test email sending with simple test endpoint

#### 2. Email Templates
Create HTML email templates in `backend/app/templates/emails/`:
- `application_submitted.html` - Sent when application reaches 100% and moves to under_review
- `application_accepted.html` - Sent when admin clicks Accept button
- `payment_received.html` - Sent when Stripe payment completes
- `admin_new_application.html` - Alert to admin team about new submission
- `admin_ready_to_accept.html` - Alert when application reaches 3 approvals

#### 3. Email Trigger Points
**Family Emails:**
1. **Application Submitted** (trigger: status → under_review)
   - Subject: "Your CAMP FASD Application Has Been Submitted"
   - Body: Thank you message, what happens next, expected timeline
   - Location: `backend/app/api/applications.py` in PATCH endpoint when hitting 100%

2. **Application Accepted** (trigger: manual accept)
   - Subject: "🎉 Congratulations! You've Been Accepted to CAMP FASD"
   - Body: Acceptance message, new sections to complete, payment information
   - Location: `backend/app/api/admin.py` in `/accept` endpoint after status change

3. **Payment Received** (trigger: Stripe webhook)
   - Subject: "Payment Confirmed - Your Spot is Reserved!"
   - Body: Payment confirmation, next steps, camp preparation info
   - Location: Future Stripe webhook handler

**Admin Emails:**
1. **New Application Submitted**
   - Subject: "New CAMP FASD Application: [Camper Name]"
   - Body: Basic info, link to admin review page
   - Sent to: All admins
   - Location: Same as family submission email

2. **Ready to Accept** (3 approvals reached)
   - Subject: "Application Ready for Acceptance: [Camper Name]"
   - Body: Lists which teams approved, link to application, Accept button reminder
   - Sent to: Super admins only
   - Location: `backend/app/api/admin.py` in `/approve` endpoint when count hits 3

#### 4. Implementation Estimate
- **Time**: 4-6 hours
- **Complexity**: Medium
- **Files to Create**: 3-4 new files
- **Files to Modify**: 2-3 existing files
- **Testing**: Send test emails, verify all triggers work

---

### Option 2: Stripe Payment Integration 🔴 **HIGH PRIORITY**

**Why This Is Important:**
- Required for completing the application lifecycle
- Generates revenue for camp operations
- Families need ability to pay after acceptance
- Can be built in parallel with email system

**What Needs to Be Built:**

#### 1. Stripe Setup
- Create Stripe account (if not already done)
- Get API keys (test mode for development)
- Install Stripe Python SDK: `pip install stripe`
- Add keys to `.env`: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

#### 2. Backend Payment Endpoints
Create `backend/app/api/payments.py`:
- **POST /api/payments/create-checkout-session**
  - Input: application_id
  - Validates: application status = 'accepted'
  - Creates: Stripe Checkout session
  - Returns: session_id and checkout URL

- **POST /api/webhooks/stripe** (for Stripe to call)
  - Validates: Stripe signature
  - Handles: `checkout.session.completed` event
  - Updates: application status → 'paid'
  - Records: payment metadata (transaction_id, amount, date)
  - Triggers: Payment confirmation email

#### 3. Database Updates
Add to `applications` table:
- `payment_id` (String) - Stripe payment intent ID
- `payment_amount` (Decimal) - Amount paid
- `paid_at` (DateTime) - Timestamp of payment

Create new table `payments`:
- `id` (UUID)
- `application_id` (UUID, FK)
- `stripe_session_id` (String)
- `stripe_payment_intent_id` (String)
- `amount` (Decimal)
- `currency` (String, default 'usd')
- `status` (String) - 'pending', 'completed', 'failed', 'refunded'
- `created_at` (DateTime)
- `completed_at` (DateTime, nullable)

#### 4. Frontend Payment Page
Create `frontend/app/dashboard/payment/[applicationId]/page.tsx`:
- Shows acceptance message
- Displays payment amount (configurable)
- "Proceed to Payment" button
- Redirects to Stripe Checkout
- Success/cancel redirect URLs

#### 5. Implementation Estimate
- **Time**: 6-8 hours
- **Complexity**: Medium-High
- **Files to Create**: 5-6 new files
- **Files to Modify**: 3-4 existing files
- **Testing**: Use Stripe test mode, test card numbers, webhook testing

---

### Option 3: Google OAuth Integration 🟡 **MEDIUM PRIORITY**

**Why This Is Useful:**
- Simplifies login for families (one-click with Google)
- Auto-assigns admin role to @fasdcamp.org emails
- Modern user expectation for auth
- Reduces password reset requests

**What Needs to Be Built:**

#### 1. Google Cloud Setup
- Create OAuth 2.0 credentials in Google Cloud Console
- Configure authorized redirect URIs
- Get client ID and client secret
- Add to `.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

#### 2. Backend OAuth Endpoints
Create `backend/app/api/oauth.py`:
- **GET /api/auth/google/login** - Redirects to Google OAuth consent screen
- **GET /api/auth/google/callback** - Handles OAuth callback
  - Exchanges code for tokens
  - Gets user info from Google
  - Creates user if doesn't exist (email as unique identifier)
  - Auto-assigns 'admin' role if email ends with '@fasdcamp.org'
  - yianni@fasdcamp.org gets 'super_admin' role
  - Generates JWT token
  - Returns token to frontend

#### 3. Frontend Updates
- Add "Continue with Google" button to login/register pages
- Styled to match Google brand guidelines
- Clicking triggers redirect to backend OAuth endpoint
- Callback page handles token storage and redirect to dashboard

#### 4. Implementation Estimate
- **Time**: 3-4 hours
- **Complexity**: Medium
- **Files to Create**: 2-3 new files
- **Files to Modify**: 2 existing files (login/register pages)
- **Testing**: Test with multiple Google accounts, verify role assignment

---

### Option 4: User Profile Management 🟡 **MEDIUM PRIORITY**

**Why This Is Useful:**
- Users can update their own information
- Reduces admin workload for user updates
- Standard feature users expect
- Improves user autonomy

**What Needs to Be Built:**

#### 1. Backend Profile Endpoints
Create/update `backend/app/api/users.py`:
- **GET /api/users/me/profile** - Get current user's full profile
- **PATCH /api/users/me/profile** - Update profile (name, phone)
- **POST /api/users/me/change-password** - Change password
  - Requires: current password, new password
  - Validates: current password is correct
  - Hashes: new password with bcrypt
- **POST /api/users/me/upload-avatar** - Upload profile picture
  - Saves to Supabase Storage
  - Returns URL
  - Updates user record

#### 2. Frontend Profile Page
Create `frontend/app/profile/page.tsx`:
- Accessible from header (user name/avatar click)
- **All Users Section**:
  - Profile picture upload with preview
  - First name, last name (editable)
  - Email (read-only display)
  - Phone number (editable)
  - Change password form (current, new, confirm)
  - Save button
- **Admin-Only Section** (if user.role !== 'family'):
  - Team assignment (read-only badge)
  - Role badge display
- **Super Admin-Only Section**:
  - "Part of all teams" indicator
  - Link to user management dashboard

#### 3. Implementation Estimate
- **Time**: 4-5 hours
- **Complexity**: Medium
- **Files to Create**: 3-4 new files
- **Files to Modify**: 2 existing files (header, layout)
- **Testing**: Test all user types, password change, avatar upload

---

## 🔧 Technical Considerations

### Email System
**Pros of SendGrid:**
- Easy to set up and use
- Good free tier (100 emails/day)
- Excellent deliverability
- Email analytics built-in

**Cons of SendGrid:**
- Costs money at scale
- Requires account verification

**Alternative: AWS SES**
- More complex setup
- Better for high volume
- Lower cost at scale

### Payment System
**Stripe Considerations:**
- Use Checkout Sessions (easier) vs. Payment Intents (more control)
- Enable customer portal for families to view receipts
- Set up refund workflow for cancellations
- Consider subscription model for returning campers

**Payment Amount:**
- Currently hardcoded? Or stored in database?
- Recommend: `system_configuration` table with `camp_fee` setting
- Super admin can adjust via configuration UI

### Security
**Important Reminders:**
- Never log sensitive data (passwords, payment info, full card numbers)
- Always validate webhook signatures (Stripe webhooks)
- Use HTTPS in production (Stripe requires it)
- Rate limit authentication endpoints
- Sanitize all email template inputs (prevent XSS)

---

## 📊 Feature Comparison Matrix

| Feature | Impact | Urgency | Effort | Dependencies | Recommended Order |
|---------|--------|---------|--------|--------------|-------------------|
| **Email Notifications** | 🔴 Critical | 🔴 High | Medium | None | **#1** |
| **Stripe Payments** | 🔴 Critical | 🔴 High | Medium-High | Email (for confirmations) | **#2** |
| **Google OAuth** | 🟡 Medium | 🟢 Low | Medium | None | **#3** |
| **User Profiles** | 🟡 Medium | 🟢 Low | Medium | OAuth (for avatar) | **#4** |
| **Admin File Upload** | 🟡 Medium | 🟡 Medium | Low | None | **#5** |
| **Landing Page** | 🟢 Low | 🟢 Low | Low | None | **#6** |
| **Super Admin Config** | 🟢 Low | 🟢 Low | High | None | **#7** |
| **Reporting & Analytics** | 🟢 Low | 🟢 Low | Medium-High | Payments | **#8** |

---

## 💡 Suggested Work Sessions

### Session 1: Email System (4-6 hours)
1. Set up SendGrid account and integrate SDK
2. Create email service with send function
3. Create all 5 email templates (basic HTML)
4. Add email triggers to existing endpoints
5. Test all email scenarios
6. Commit and deploy

**Outcome**: All stakeholders get notified at key workflow points

### Session 2: Stripe Integration (6-8 hours)
1. Set up Stripe account (test mode)
2. Create payment endpoints and webhook
3. Add payment database tables/fields
4. Build payment UI page for families
5. Test with Stripe test cards
6. Test webhook locally (Stripe CLI)
7. Commit and deploy

**Outcome**: Families can complete payment, applications can reach 'paid' status

### Session 3: Polish & Enhancement (4-5 hours)
1. Add Google OAuth for easier login
2. Build user profile page
3. Improve email templates with better styling
4. Add payment receipt view for families
5. Test end-to-end workflow

**Outcome**: Complete user experience from application to payment

### Session 4: Super Admin Tools (6-8 hours)
1. Build super admin user management dashboard
2. Add ability to manually override statuses
3. Create reports dashboard (application stats)
4. Add CSV export for applications
5. Build invoice overview for payments

**Outcome**: Super admin has full control and visibility

---

## 🚀 Quick Start: Email System

If you want to start with email notifications (recommended), here's your roadmap:

### Step 1: SendGrid Setup (15 minutes)
```bash
# 1. Create free SendGrid account at sendgrid.com
# 2. Verify sender email (use yianni@fasdcamp.org or noreply@fasdcamp.org)
# 3. Create API key with "Mail Send" permission
# 4. Add to backend/.env:
SENDGRID_API_KEY="your_api_key_here"
SENDGRID_FROM_EMAIL="noreply@fasdcamp.org"
SENDGRID_FROM_NAME="CAMP FASD"

# 5. Install SendGrid SDK
cd backend
source .venv/bin/activate
pip install sendgrid
```

### Step 2: Create Email Service (30 minutes)
```python
# backend/app/services/email_service.py
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.client = SendGridAPIClient(settings.SENDGRID_API_KEY)

    def send_email(self, to_email: str, subject: str, html_content: str):
        message = Mail(
            from_email=(settings.SENDGRID_FROM_EMAIL, settings.SENDGRID_FROM_NAME),
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        try:
            response = self.client.send(message)
            return response.status_code == 202
        except Exception as e:
            print(f"Email send error: {str(e)}")
            return False

email_service = EmailService()
```

### Step 3: Create First Template (30 minutes)
```html
<!-- backend/app/templates/emails/application_accepted.html -->
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #316429; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f4f4f4; }
        .button { display: inline-block; padding: 12px 24px; background: #e26e15; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Congratulations!</h1>
        </div>
        <div class="content">
            <h2>Your application has been accepted!</h2>
            <p>Dear {{family_name}},</p>
            <p>We're excited to welcome {{camper_name}} to CAMP FASD {{year}}!</p>
            <p>We need a few more details to complete your registration. Please log in to your dashboard to:</p>
            <ul>
                <li>Provide travel arrangements</li>
                <li>Submit t-shirt size and dietary information</li>
                <li>Complete emergency contact details</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{dashboard_url}}" class="button">Complete Registration</a>
            </p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>See you at camp!</p>
            <p><strong>The CAMP FASD Team</strong></p>
        </div>
    </div>
</body>
</html>
```

### Step 4: Add Email Trigger (15 minutes)
```python
# In backend/app/api/admin.py, in the accept_application endpoint:
from app.services.email_service import email_service

# After accepting application...
application.status = 'accepted'
application.accepted_at = datetime.now(timezone.utc)
db.commit()

# Send acceptance email
user = db.query(User).filter(User.id == application.user_id).first()
if user:
    html = render_template('emails/application_accepted.html',
        family_name=user.first_name,
        camper_name=application.camper_first_name,
        year=datetime.now().year,
        dashboard_url=f"{settings.FRONTEND_URL}/dashboard"
    )
    email_service.send_email(
        to_email=user.email,
        subject="🎉 Congratulations! You've Been Accepted to CAMP FASD",
        html_content=html
    )
```

### Step 5: Test (15 minutes)
1. Accept an application as admin
2. Check email inbox (use real email for testing)
3. Verify email formatting looks good
4. Test links work
5. Repeat for other email types

---

## 📈 Success Metrics

After completing the recommended next steps, you'll be able to measure:

### Email System Success
- ✅ All families receive confirmation when submitting application
- ✅ All families receive acceptance notification
- ✅ Admins get notified of new submissions within 5 minutes
- ✅ No spam folder issues (>90% inbox delivery)
- ✅ Email open rate >60%

### Payment System Success
- ✅ Families can complete payment within 2 clicks from dashboard
- ✅ Payment confirmation within 30 seconds
- ✅ 100% webhook delivery (with retries)
- ✅ Stripe transaction fees calculated correctly
- ✅ Refund workflow works for cancellations

### Overall System Success
- ✅ Complete application lifecycle: submit → review → approve → accept → pay
- ✅ No manual admin intervention required for standard workflow
- ✅ All state transitions logged and auditable
- ✅ Families have clear visibility into application status
- ✅ Admins have full visibility into payment status

---

## 🎬 Conclusion

**Current State**: You have a fully functional application system with conditional questions and manual acceptance workflow. The core features are solid and tested.

**Recommended Next Action**: **Build the email notification system.** It's the missing piece that connects all your hard work and ensures families actually know their application was accepted and they have new sections to complete.

**After That**: Payment integration, then user experience enhancements (OAuth, profiles, landing page), and finally super admin tools.

**Timeline Estimate**:
- Email System: 1 session (4-6 hours)
- Payment System: 1-2 sessions (6-8 hours)
- Enhancements: 1 session (4-5 hours)
- **Total to MVP**: 3-4 sessions, approximately 14-19 hours of development

You're in great shape! The foundation is strong, and you're now building the polish that makes this a production-ready system.

Let me know which direction you'd like to go! 🚀
