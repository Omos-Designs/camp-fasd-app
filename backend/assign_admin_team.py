"""
Assign team to admin user
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
    # Assign ops team to admin@fasdcamp.org
    print("Assigning 'ops' team to admin@fasdcamp.org...")
    cur.execute("""
        UPDATE users
        SET team = 'ops'
        WHERE email = 'admin@fasdcamp.org';
    """)

    # Check how many rows were updated
    rows_updated = cur.rowcount
    print(f"✓ Updated {rows_updated} user(s)")

    # Verify the update
    cur.execute("""
        SELECT email, role, team
        FROM users
        WHERE email = 'admin@fasdcamp.org';
    """)

    result = cur.fetchone()
    if result:
        print(f"\nVerification:")
        print(f"  Email: {result[0]}")
        print(f"  Role: {result[1]}")
        print(f"  Team: {result[2]}")
    else:
        print("\n✗ User not found!")

    conn.commit()
    print("\n✓ Team assignment complete!")

except Exception as e:
    conn.rollback()
    print(f"✗ Error: {e}")

finally:
    cur.close()
    conn.close()
