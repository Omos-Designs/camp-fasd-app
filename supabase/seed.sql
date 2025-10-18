-- CAMP FASD Application Portal - Seed Data

-- Insert default super admin (password: ChangeMe123!)
-- Note: In production, this should be changed immediately
INSERT INTO users (email, password_hash, role, first_name, last_name, email_verified)
VALUES (
    'yianni@fasdcamp.org',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7ElkZS7K0G', -- ChangeMe123!
    'super_admin',
    'Super',
    'Admin',
    TRUE
);

-- Insert application sections in order
INSERT INTO application_sections (title, description, order_index, visible_before_acceptance) VALUES
('Overview', 'Basic information about your camper and your family', 1, TRUE),
('Camper Information', 'Demographic and personal information about your camper', 2, TRUE),
('Applicant Background', 'Information about the person completing this application', 3, TRUE),
('FASD Screener', 'Questions to understand your camper''s FASD diagnosis and needs', 4, TRUE),
('Medical History', 'Overview of your camper''s medical background', 5, TRUE),
('Medical Details', 'Daily medications and medical routines', 6, TRUE),
('Insurance', 'Upload your insurance card information', 7, TRUE),
('Healthcare Providers', 'Contact information for your camper''s medical providers', 8, TRUE),
('IEP/504 Plan', 'Upload your camper''s Individualized Education Program or 504 Plan', 9, TRUE),
('COVID-19 Acknowledgment', 'COVID-19 policies and acknowledgment', 10, TRUE),
('Medical History Form', 'Download, complete, and upload the detailed medical history form', 11, TRUE),
('Immunizations', 'Upload immunization records', 12, TRUE),
('Letter to My Counselor', 'A letter to help counselors understand your camper', 13, TRUE),
('Authorizations', 'Required authorization signatures', 14, TRUE),
('Additional Camper Information', 'Additional details about your camper', 15, TRUE),
('Emergency Contact Information', 'Emergency contacts besides parents/guardians', 16, TRUE),
('Authorization Release', 'Final authorization and release forms', 17, TRUE);

-- Insert sample questions for each section
-- Section 1: Overview
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, options)
SELECT id, 'Has your family previously attended CAMP FASD?', 'dropdown', TRUE, FALSE, 1,
    '["Yes - We are returning campers", "No - This is our first time"]'::jsonb
FROM application_sections WHERE title = 'Overview';

-- Section 2: Camper Information
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, placeholder)
SELECT id, 'Camper First Name', 'text', TRUE, FALSE, 1, 'Enter first name'
FROM application_sections WHERE title = 'Camper Information';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, placeholder)
SELECT id, 'Camper Last Name', 'text', TRUE, FALSE, 2, 'Enter last name'
FROM application_sections WHERE title = 'Camper Information';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index)
SELECT id, 'Date of Birth', 'date', TRUE, FALSE, 3
FROM application_sections WHERE title = 'Camper Information';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, options)
SELECT id, 'Gender', 'dropdown', TRUE, FALSE, 4,
    '["Male", "Female", "Non-binary", "Prefer not to say", "Prefer to self-describe"]'::jsonb
FROM application_sections WHERE title = 'Camper Information';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, options)
SELECT id, 'T-Shirt Size', 'dropdown', TRUE, TRUE, 5,
    '["Youth XS", "Youth S", "Youth M", "Youth L", "Youth XL", "Adult S", "Adult M", "Adult L", "Adult XL", "Adult XXL"]'::jsonb
FROM application_sections WHERE title = 'Camper Information';

-- Section 3: Applicant Background
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, placeholder)
SELECT id, 'Your First Name', 'text', TRUE, FALSE, 1, 'Enter your first name'
FROM application_sections WHERE title = 'Applicant Background';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, placeholder)
SELECT id, 'Your Last Name', 'text', TRUE, FALSE, 2, 'Enter your last name'
FROM application_sections WHERE title = 'Applicant Background';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, placeholder)
SELECT id, 'Your Email Address', 'email', TRUE, FALSE, 3, 'your.email@example.com'
FROM application_sections WHERE title = 'Applicant Background';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, placeholder)
SELECT id, 'Your Phone Number', 'phone', TRUE, TRUE, 4, '(555) 123-4567'
FROM application_sections WHERE title = 'Applicant Background';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, options)
SELECT id, 'Relationship to Camper', 'dropdown', TRUE, FALSE, 5,
    '["Biological Parent", "Adoptive Parent", "Foster Parent", "Legal Guardian", "Grandparent", "Other Family Member"]'::jsonb
FROM application_sections WHERE title = 'Applicant Background';

-- Section 4: FASD Screener
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, options)
SELECT id, 'Has your camper been diagnosed with an FASD?', 'dropdown', TRUE, FALSE, 1,
    '["Yes", "No", "Under evaluation"]'::jsonb
FROM application_sections WHERE title = 'FASD Screener';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, help_text)
SELECT id, 'Please describe your camper''s diagnosis and any specific considerations', 'textarea', FALSE, TRUE, 2,
    'Include diagnosis details, behavioral considerations, and anything else the medical team should know'
FROM application_sections WHERE title = 'FASD Screener';

-- Section 6: Medical Details
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, help_text)
SELECT id, 'Please list all current medications, dosages, and administration times', 'textarea', TRUE, TRUE, 1,
    'Include prescription and over-the-counter medications. Format: Medication name, dosage, time(s) per day'
FROM application_sections WHERE title = 'Medical Details';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index)
SELECT id, 'Does your camper have any allergies (food, medication, environmental)?', 'textarea', TRUE, TRUE, 2
FROM application_sections WHERE title = 'Medical Details';

-- Section 7: Insurance
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, help_text)
SELECT id, 'Upload front of insurance card', 'file_upload', TRUE, TRUE, 1,
    'Accepted formats: PDF, JPG, PNG (Max 10MB)'
FROM application_sections WHERE title = 'Insurance';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, help_text)
SELECT id, 'Upload back of insurance card', 'file_upload', TRUE, TRUE, 2,
    'Accepted formats: PDF, JPG, PNG (Max 10MB)'
FROM application_sections WHERE title = 'Insurance';

-- Section 8: Healthcare Providers
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, placeholder)
SELECT id, 'Primary Care Physician Name', 'text', TRUE, TRUE, 1, 'Dr. First Last'
FROM application_sections WHERE title = 'Healthcare Providers';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, placeholder)
SELECT id, 'Primary Care Physician Phone', 'phone', TRUE, TRUE, 2, '(555) 123-4567'
FROM application_sections WHERE title = 'Healthcare Providers';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, placeholder)
SELECT id, 'Preferred Hospital/Emergency Care Facility', 'text', TRUE, TRUE, 3, 'Hospital name and location'
FROM application_sections WHERE title = 'Healthcare Providers';

-- Section 9: IEP
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, options)
SELECT id, 'Does your camper have an IEP or 504 Plan?', 'dropdown', TRUE, FALSE, 1,
    '["Yes - IEP", "Yes - 504 Plan", "No", "In process"]'::jsonb
FROM application_sections WHERE title = 'IEP/504 Plan';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, help_text)
SELECT id, 'Upload IEP or 504 Plan document', 'file_upload', FALSE, TRUE, 2,
    'Please upload the most recent IEP or 504 Plan. Accepted formats: PDF (Max 10MB)'
FROM application_sections WHERE title = 'IEP/504 Plan';

-- Section 10: COVID-19
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index)
SELECT id, 'I have read and agree to the COVID-19 policies', 'checkbox', TRUE, TRUE, 1
FROM application_sections WHERE title = 'COVID-19 Acknowledgment';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, help_text)
SELECT id, 'Upload signed COVID-19 acknowledgment form', 'file_upload', TRUE, TRUE, 2,
    'Download the form from the link above, sign it, and upload. Accepted formats: PDF (Max 10MB)'
FROM application_sections WHERE title = 'COVID-19 Acknowledgment';

-- Section 11: Medical History Form
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, help_text)
SELECT id, 'Upload completed Medical History Form', 'file_upload', TRUE, TRUE, 1,
    'Download the form using the button above, complete all sections, and upload. Accepted formats: PDF (Max 10MB)'
FROM application_sections WHERE title = 'Medical History Form';

-- Section 12: Immunizations
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, help_text)
SELECT id, 'Upload immunization records', 'file_upload', TRUE, TRUE, 1,
    'Please upload current immunization records. Accepted formats: PDF, JPG, PNG (Max 10MB)'
FROM application_sections WHERE title = 'Immunizations';

-- Section 13: Letter to Counselor
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, help_text)
SELECT id, 'Upload Letter to My Counselor', 'file_upload', TRUE, TRUE, 1,
    'Download the template, complete the letter, and upload. Accepted formats: PDF, DOCX (Max 10MB)'
FROM application_sections WHERE title = 'Letter to My Counselor';

-- Section 14: Authorizations
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index)
SELECT id, 'I authorize CAMP FASD staff to administer medications as prescribed', 'checkbox', TRUE, TRUE, 1
FROM application_sections WHERE title = 'Authorizations';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index)
SELECT id, 'I authorize CAMP FASD to seek emergency medical treatment if needed', 'checkbox', TRUE, TRUE, 2
FROM application_sections WHERE title = 'Authorizations';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index)
SELECT id, 'Parent/Guardian Signature', 'signature', TRUE, TRUE, 3
FROM application_sections WHERE title = 'Authorizations';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index)
SELECT id, 'Date', 'date', TRUE, TRUE, 4
FROM application_sections WHERE title = 'Authorizations';

-- Section 15: Additional Information
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, help_text)
SELECT id, 'Behavioral considerations and strategies that work well', 'textarea', FALSE, TRUE, 1,
    'Share information that will help counselors support your camper''s success'
FROM application_sections WHERE title = 'Additional Camper Information';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index)
SELECT id, 'Dietary restrictions or preferences', 'textarea', FALSE, TRUE, 2
FROM application_sections WHERE title = 'Additional Camper Information';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index)
SELECT id, 'Any other information you''d like us to know', 'textarea', FALSE, TRUE, 3
FROM application_sections WHERE title = 'Additional Camper Information';

-- Section 16: Emergency Contacts
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, placeholder)
SELECT id, 'Emergency Contact 1 - Name', 'text', TRUE, TRUE, 1, 'Full name'
FROM application_sections WHERE title = 'Emergency Contact Information';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, placeholder)
SELECT id, 'Emergency Contact 1 - Phone', 'phone', TRUE, TRUE, 2, '(555) 123-4567'
FROM application_sections WHERE title = 'Emergency Contact Information';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, placeholder)
SELECT id, 'Emergency Contact 1 - Relationship', 'text', TRUE, TRUE, 3, 'e.g., Aunt, Family Friend'
FROM application_sections WHERE title = 'Emergency Contact Information';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, placeholder)
SELECT id, 'Emergency Contact 2 - Name', 'text', FALSE, TRUE, 4, 'Full name'
FROM application_sections WHERE title = 'Emergency Contact Information';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index, placeholder)
SELECT id, 'Emergency Contact 2 - Phone', 'phone', FALSE, TRUE, 5, '(555) 123-4567'
FROM application_sections WHERE title = 'Emergency Contact Information';

-- Section 17: Authorization Release
INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index)
SELECT id, 'I grant permission for my camper to participate in all camp activities', 'checkbox', TRUE, TRUE, 1
FROM application_sections WHERE title = 'Authorization Release';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index)
SELECT id, 'I grant permission for CAMP FASD to use photos/videos of my camper', 'checkbox', FALSE, TRUE, 2
FROM application_sections WHERE title = 'Authorization Release';

INSERT INTO application_questions (section_id, question_text, question_type, is_required, reset_annually, order_index)
SELECT id, 'I have reviewed all information and certify it is accurate', 'checkbox', TRUE, TRUE, 3
FROM application_sections WHERE title = 'Authorization Release';

-- Insert system configuration defaults
INSERT INTO system_config (config_key, config_value, description) VALUES
('invoice_base_amount', '{"amount": 1500.00, "currency": "usd"}'::jsonb, 'Base tuition amount for camp'),
('max_scholarship_percentage', '{"percentage": 100}'::jsonb, 'Maximum scholarship percentage allowed'),
('application_deadline', '{"date": "2025-06-01"}'::jsonb, 'Application deadline for current season'),
('camp_dates', '{"start": "2025-07-15", "end": "2025-07-20"}'::jsonb, 'Current camp session dates'),
('contact_email', '{"email": "admin@fasdcamp.org"}'::jsonb, 'Main contact email for camp');

-- Insert default email templates
INSERT INTO email_templates (template_name, subject, body, variables, trigger_event) VALUES
(
    'welcome',
    'Welcome to CAMP FASD!',
    'Dear {{firstName}},\n\nWelcome to CAMP FASD! We''re excited to have you start your application.\n\nYou can access your application at any time by logging into your account.\n\nIf you have any questions, please contact us at {{contactEmail}}.\n\nBest regards,\nThe CAMP FASD Team',
    '["firstName", "contactEmail"]'::jsonb,
    'user_registration'
),
(
    'application_reminder',
    'Your CAMP FASD application is {{completionPercentage}}% complete',
    'Dear {{firstName}},\n\nYour CAMP FASD application is currently {{completionPercentage}}% complete. We encourage you to complete the remaining sections at your earliest convenience.\n\nLog in to continue: {{applicationUrl}}\n\nApplication deadline: {{deadline}}\n\nBest regards,\nThe CAMP FASD Team',
    '["firstName", "completionPercentage", "applicationUrl", "deadline"]'::jsonb,
    'completion_reminder'
),
(
    'application_submitted',
    'Your CAMP FASD application has been submitted',
    'Dear {{firstName}},\n\nThank you for submitting your application for {{camperName}}!\n\nOur team will review your application and be in touch soon. You can check the status of your application at any time by logging into your account.\n\nBest regards,\nThe CAMP FASD Team',
    '["firstName", "camperName"]'::jsonb,
    'application_submitted'
),
(
    'application_accepted',
    'Congratulations! {{camperName}} has been accepted to CAMP FASD',
    'Dear {{firstName}},\n\nWe are thrilled to inform you that {{camperName}} has been accepted to CAMP FASD!\n\nNext steps:\n1. Review the attached invoice\n2. Complete payment by {{paymentDeadline}}\n3. We''ll send additional information about camp closer to the session dates\n\nPayment link: {{invoiceUrl}}\n\nWe look forward to seeing {{camperName}} at camp!\n\nBest regards,\nThe CAMP FASD Team',
    '["firstName", "camperName", "paymentDeadline", "invoiceUrl"]'::jsonb,
    'application_accepted'
),
(
    'payment_received',
    'Payment received - {{camperName}} is all set for CAMP!',
    'Dear {{firstName}},\n\nWe have received your payment for {{camperName}}''s camp tuition. Everything is set!\n\nCamp Details:\nDates: {{campDates}}\nCheck-in: {{checkInTime}}\nCheck-out: {{checkOutTime}}\n\nWe''ll send more information about what to bring and the schedule as we get closer to camp.\n\nBest regards,\nThe CAMP FASD Team',
    '["firstName", "camperName", "campDates", "checkInTime", "checkOutTime"]'::jsonb,
    'payment_received'
);

-- Insert default assignable options
INSERT INTO assignable_options (option_type, option_value) VALUES
('cabin', 'Cabin 1'),
('cabin', 'Cabin 2'),
('cabin', 'Cabin 3'),
('cabin', 'Cabin 4'),
('cabin', 'Cabin 5'),
('cabin', 'Cabin 6'),
('dietary_restriction', 'Vegetarian'),
('dietary_restriction', 'Vegan'),
('dietary_restriction', 'Gluten-Free'),
('dietary_restriction', 'Dairy-Free'),
('dietary_restriction', 'Nut Allergy'),
('admin_team', 'Operations'),
('admin_team', 'Behavioral Health'),
('admin_team', 'Medical');

-- Create a function to calculate application completion percentage
CREATE OR REPLACE FUNCTION calculate_completion_percentage(app_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_required INTEGER;
    completed_required INTEGER;
    percentage INTEGER;
BEGIN
    -- Count total required questions
    SELECT COUNT(*)
    INTO total_required
    FROM application_questions
    WHERE is_required = TRUE AND is_active = TRUE;

    -- Count completed required questions
    SELECT COUNT(*)
    INTO completed_required
    FROM application_responses ar
    INNER JOIN application_questions aq ON ar.question_id = aq.id
    WHERE ar.application_id = app_id
    AND aq.is_required = TRUE
    AND aq.is_active = TRUE
    AND (ar.response_value IS NOT NULL OR ar.file_id IS NOT NULL);

    -- Calculate percentage
    IF total_required > 0 THEN
        percentage := ROUND((completed_required::NUMERIC / total_required::NUMERIC) * 100);
    ELSE
        percentage := 0;
    END IF;

    RETURN percentage;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if all teams have approved
CREATE OR REPLACE FUNCTION check_full_approval(app_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_approved BOOLEAN;
BEGIN
    SELECT ops_approved AND behavioral_approved AND medical_approved
    INTO is_approved
    FROM applications
    WHERE id = app_id;

    RETURN COALESCE(is_approved, FALSE);
END;
$$ LANGUAGE plpgsql;
