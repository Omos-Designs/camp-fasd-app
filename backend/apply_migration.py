"""Apply migration 010 to update question type constraint"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
database_url = os.getenv("DATABASE_URL")

# Create engine
engine = create_engine(database_url)

# Migration SQL
migration_sql = """
-- Drop the existing check constraint
ALTER TABLE application_questions DROP CONSTRAINT IF EXISTS application_questions_question_type_check;

-- Add the new check constraint with medication_list and allergy_list included
ALTER TABLE application_questions
ADD CONSTRAINT application_questions_question_type_check
CHECK (question_type IN (
  'text',
  'textarea',
  'dropdown',
  'multiple_choice',
  'checkbox',
  'file_upload',
  'profile_picture',
  'medication_list',
  'allergy_list',
  'date',
  'email',
  'phone',
  'signature'
));
"""

# Apply migration
with engine.connect() as conn:
    conn.execute(text(migration_sql))
    conn.commit()
    print("✅ Migration applied successfully!")
    print("✅ medication_list and allergy_list question types are now allowed")
