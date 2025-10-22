-- Migration: Add detail prompt fields to application_questions
-- Allows questions to show a follow-up detail prompt based on specific answers
-- Example: "Does camper have allergies?" Yes → "Please provide details"

ALTER TABLE application_questions
ADD COLUMN detail_prompt_trigger VARCHAR(255),  -- The answer that triggers the detail prompt (e.g., "Yes")
ADD COLUMN detail_prompt_text TEXT;             -- The prompt text (e.g., "Please provide details about the allergies")

COMMENT ON COLUMN application_questions.detail_prompt_trigger IS 'Answer value that triggers showing the detail prompt';
COMMENT ON COLUMN application_questions.detail_prompt_text IS 'Text shown for the detail textarea when trigger answer is selected';

-- Example usage:
-- Question: "Does the camper have allergies?" (dropdown: Yes/No)
-- detail_prompt_trigger: "Yes"
-- detail_prompt_text: "Please provide details about the allergies (specific allergens, severity, required medications, etc.)"
-- When user selects "Yes", a textarea appears below asking for details
