"""
Check the status constraint on applications table
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
    # Get the check constraint definition
    print("Checking status constraint on applications table...")
    print("=" * 80)

    cur.execute("""
        SELECT conname, pg_get_constraintdef(oid) as definition
        FROM pg_constraint
        WHERE conrelid = 'applications'::regclass
        AND contype = 'c'
        AND conname LIKE '%status%';
    """)

    results = cur.fetchall()
    for row in results:
        constraint_name, definition = row
        print(f"Constraint: {constraint_name}")
        print(f"Definition: {definition}")
        print()

    # Also check what statuses are currently in use
    print("Current statuses in use:")
    print("-" * 80)
    cur.execute("""
        SELECT DISTINCT status, COUNT(*) as count
        FROM applications
        GROUP BY status
        ORDER BY status;
    """)

    results = cur.fetchall()
    for row in results:
        status, count = row
        print(f"  {status}: {count} applications")

except Exception as e:
    print(f"✗ Error: {e}")

finally:
    cur.close()
    conn.close()
