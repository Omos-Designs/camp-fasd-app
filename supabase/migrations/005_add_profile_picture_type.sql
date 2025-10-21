-- Add profile_picture to question_type check constraint
ALTER TABLE application_questions 
DROP CONSTRAINT IF EXISTS application_questions_question_type_check;

ALTER TABLE application_questions 
ADD CONSTRAINT application_questions_question_type_check 
CHECK (question_type IN (
  'text',
  'textarea', 
  'dropdown',
  'multiple_choice',
  'file_upload',
  'checkbox',
  'date',
  'email',
  'phone',
  'signature',
  'profile_picture'
));

COMMENT ON CONSTRAINT application_questions_question_type_check ON application_questions IS 
  'Allowed question types including profile_picture for camper photos';
