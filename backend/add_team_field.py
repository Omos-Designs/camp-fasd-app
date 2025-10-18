"""
Add team field to users table
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
    # Add team column to users table
    print("Adding team column to users table...")
    cur.execute("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS team VARCHAR(20);
    """)

    conn.commit()
    print("✓ Successfully added team column to users table")

except Exception as e:
    conn.rollback()
    print(f"✗ Error: {e}")

finally:
    cur.close()
    conn.close()
    print("\nMigration complete!")
