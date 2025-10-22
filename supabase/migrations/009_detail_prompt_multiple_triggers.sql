-- Migration: Change detail_prompt_trigger from VARCHAR to JSONB array
-- Allows multiple answers to trigger the detail prompt
-- Example: ["Seldom", "Never"] both trigger asking for details

-- Change the column type to JSONB to store array of triggers
ALTER TABLE application_questions
ALTER COLUMN detail_prompt_trigger TYPE JSONB USING
  CASE
    WHEN detail_prompt_trigger IS NULL THEN NULL
    ELSE to_jsonb(ARRAY[detail_prompt_trigger])
  END;

COMMENT ON COLUMN application_questions.detail_prompt_trigger IS 'Array of answer values that trigger showing the detail prompt (e.g., ["Seldom", "Never"])';

-- Example usage:
-- Question: "Does camper have good manners?" (dropdown: Often, Seldom, Never)
-- detail_prompt_trigger: ["Seldom", "Never"]
-- detail_prompt_text: "Please describe the camper's behavior and any challenges"
-- When user selects "Seldom" OR "Never", the detail textarea appears
