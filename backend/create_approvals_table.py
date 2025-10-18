"""
Create application_approvals table for tracking individual admin approvals
"""

import os
from dotenv import load_dotenv
import psycopg2

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Connect to database
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

try:
    print("Creating application_approvals table...")
    print("=" * 80)

    # Create the table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS application_approvals (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
            admin_id UUID NOT NULL REFERENCES users(id),
            approved BOOLEAN NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(application_id, admin_id)
        );
    """)

    # Create index for faster lookups
    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_application_approvals_application_id
        ON application_approvals(application_id);
    """)

    conn.commit()
    print("✓ Successfully created application_approvals table")
    print("✓ Created index on application_id")

    # Verify
    cur.execute("""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'application_approvals'
        ORDER BY ordinal_position;
    """)

    print("\nTable structure:")
    print("-" * 80)
    for row in cur.fetchall():
        print(f"  {row[0]}: {row[1]}")

except Exception as e:
    conn.rollback()
    print(f"✗ Error: {e}")

finally:
    cur.close()
    conn.close()
    print("\n✓ Migration complete!")
