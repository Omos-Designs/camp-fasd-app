-- Migration: Add Conditional Questions Support
-- Allows sections/questions to only appear when application reaches certain status
-- Use case: Post-acceptance questions that families complete after being accepted

-- Add show_when_status column to application_sections
ALTER TABLE application_sections
ADD COLUMN show_when_status VARCHAR(20) DEFAULT NULL;

-- Add show_when_status column to application_questions
ALTER TABLE application_questions
ADD COLUMN show_when_status VARCHAR(20) DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN application_sections.show_when_status IS
'Status required for this section to be visible. NULL = always visible. Values: accepted, paid';

COMMENT ON COLUMN application_questions.show_when_status IS
'Status required for this question to be visible. NULL = always visible. Values: accepted, paid';

-- Add check constraints to ensure valid status values
ALTER TABLE application_sections
ADD CONSTRAINT check_section_show_when_status
CHECK (show_when_status IS NULL OR show_when_status IN ('accepted', 'paid'));

ALTER TABLE application_questions
ADD CONSTRAINT check_question_show_when_status
CHECK (show_when_status IS NULL OR show_when_status IN ('accepted', 'paid'));

-- Create indexes for performance when filtering by status
CREATE INDEX idx_sections_show_when_status ON application_sections(show_when_status);
CREATE INDEX idx_questions_show_when_status ON application_questions(show_when_status);
