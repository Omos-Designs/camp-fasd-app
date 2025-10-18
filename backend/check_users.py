"""
Check users in database
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
    # Get all users
    print("Users in database:")
    print("=" * 80)
    cur.execute("""
        SELECT email, role, team, first_name, last_name
        FROM users
        ORDER BY role DESC, email;
    """)

    results = cur.fetchall()
    for row in results:
        email, role, team, first_name, last_name = row
        team_str = f"[{team}]" if team else "[no team]"
        print(f"{email:40} | {role:15} | {team_str:15} | {first_name} {last_name}")

    print(f"\nTotal users: {len(results)}")

except Exception as e:
    print(f"✗ Error: {e}")

finally:
    cur.close()
    conn.close()
