-- Add conditional logic columns to application_questions
-- Allows questions to be shown/hidden based on answers to previous questions

ALTER TABLE application_questions
ADD COLUMN show_if_question_id UUID REFERENCES application_questions(id) ON DELETE CASCADE,
ADD COLUMN show_if_answer TEXT;

CREATE INDEX idx_questions_show_if ON application_questions(show_if_question_id);

COMMENT ON COLUMN application_questions.show_if_question_id IS 
  'Reference to another question - this question only shows if that question has a specific answer';

COMMENT ON COLUMN application_questions.show_if_answer IS 
  'The answer value that triggers this question to be shown. Can be exact match or comma-separated values for multiple triggers';

-- Example:
-- Question: "Does parent live at different address?"
--   Options: ["Yes", "No"]
-- 
-- Follow-up questions (only show if answer is "Yes"):
--   - "Parent Street Address" (show_if_question_id = parent question ID, show_if_answer = "Yes")
--   - "Parent City" (show_if_question_id = parent question ID, show_if_answer = "Yes")
--   - "Parent State" (show_if_question_id = parent question ID, show_if_answer = "Yes")
--   - "Parent ZIP" (show_if_question_id = parent question ID, show_if_answer = "Yes")
