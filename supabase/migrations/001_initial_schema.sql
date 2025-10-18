-- CAMP FASD Application Portal - Initial Schema Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    google_id VARCHAR(255) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Application sections
CREATE TABLE application_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    visible_before_acceptance BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sections_order ON application_sections(order_index);

-- Application questions
CREATE TABLE application_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES application_sections(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN (
        'text', 'textarea', 'dropdown', 'multiple_choice',
        'file_upload', 'checkbox', 'date', 'email', 'phone', 'signature'
    )),
    options JSONB,
    is_required BOOLEAN DEFAULT FALSE,
    reset_annually BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL,
    validation_rules JSONB,
    help_text TEXT,
    placeholder TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_questions_section ON application_questions(section_id);
CREATE INDEX idx_questions_order ON application_questions(order_index);

-- Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    camper_first_name VARCHAR(100),
    camper_last_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN (
        'in_progress', 'under_review', 'accepted', 'declined', 'paid'
    )),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    is_returning_camper BOOLEAN DEFAULT FALSE,
    cabin_assignment VARCHAR(50),
    application_data JSONB DEFAULT '{}'::jsonb,
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

CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_cabin ON applications(cabin_assignment);

-- Application responses
CREATE TABLE application_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    question_id UUID REFERENCES application_questions(id) ON DELETE CASCADE,
    response_value TEXT,
    file_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(application_id, question_id)
);

CREATE INDEX idx_responses_application ON application_responses(application_id);
CREATE INDEX idx_responses_question ON application_responses(question_id);

-- Files
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    storage_path VARCHAR(500) NOT NULL,
    section VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_files_application ON files(application_id);

-- Add foreign key constraint for application_responses.file_id
ALTER TABLE application_responses
ADD CONSTRAINT fk_responses_file
FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE SET NULL;

-- Admin notes
CREATE TABLE admin_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES users(id),
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notes_application ON admin_notes(application_id);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    stripe_invoice_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    scholarship_applied BOOLEAN DEFAULT FALSE,
    scholarship_note TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void')),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoices_application ON invoices(application_id);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);

-- System configuration
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_config_key ON system_config(config_key);

-- Email templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    variables JSONB,
    trigger_event VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_templates_name ON email_templates(template_name);
CREATE INDEX idx_templates_trigger ON email_templates(trigger_event);

-- Assignable options (for cabins, etc.)
CREATE TABLE assignable_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    option_type VARCHAR(100) NOT NULL,
    option_value VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(option_type, option_value)
);

CREATE INDEX idx_options_type ON assignable_options(option_type);

-- Email logs
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    template_used VARCHAR(100),
    sent_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50),
    error_message TEXT
);

CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_sections_updated_at BEFORE UPDATE ON application_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_questions_updated_at BEFORE UPDATE ON application_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_responses_updated_at BEFORE UPDATE ON application_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_notes_updated_at BEFORE UPDATE ON admin_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignable_options ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Applications: Users can only see their own
CREATE POLICY "Users can view own applications" ON applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON applications
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can see all applications
CREATE POLICY "Admins can view all applications" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Similar policies for other tables...
-- (Additional RLS policies would be created based on specific requirements)

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with role-based access';
COMMENT ON TABLE applications IS 'Camper applications with approval workflow';
COMMENT ON TABLE application_sections IS 'Dynamic application form sections';
COMMENT ON TABLE application_questions IS 'Dynamic application form questions';
COMMENT ON TABLE application_responses IS 'User responses to application questions';
COMMENT ON TABLE files IS 'Uploaded files linked to applications';
COMMENT ON TABLE admin_notes IS 'Internal notes for admin teams';
COMMENT ON TABLE invoices IS 'Stripe invoices for accepted campers';
COMMENT ON TABLE system_config IS 'System-wide configuration settings';
COMMENT ON TABLE email_templates IS 'Email templates for notifications';
COMMENT ON TABLE assignable_options IS 'Dynamic options for admin assignments';
COMMENT ON TABLE email_logs IS 'Log of all emails sent';
