"""
Test approve endpoint to see the actual error
"""
import requests
import sys

# You'll need to provide a valid token and application_id
# Get these from the browser console or by logging in

print("Testing approve endpoint...")
print("=" * 60)

# First, let's try to login
login_data = {
    "email": "admin@fasdcamp.org",
    "password": input("Enter admin password: ")
}

login_response = requests.post(
    'http://localhost:8000/api/auth/login',
    json=login_data
)

if login_response.status_code != 200:
    print(f"✗ Login failed: {login_response.status_code}")
    print(login_response.text)
    sys.exit(1)

token = login_response.json()['access_token']
print("✓ Login successful\n")

# Get an application
apps_response = requests.get(
    'http://localhost:8000/api/applications/admin/all',
    headers={'Authorization': f'Bearer {token}'}
)

if apps_response.status_code != 200:
    print(f"✗ Failed to get applications: {apps_response.status_code}")
    print(apps_response.text)
    sys.exit(1)

apps = apps_response.json()
if len(apps) == 0:
    print("✗ No applications found")
    sys.exit(1)

app_id = apps[0]['id']
print(f"Testing with application: {app_id}\n")

# Try to approve
print("Attempting to approve...")
approve_response = requests.post(
    f'http://localhost:8000/api/admin/applications/{app_id}/approve',
    headers={'Authorization': f'Bearer {token}'}
)

print(f"Status Code: {approve_response.status_code}")
print(f"Response: {approve_response.text}")

if approve_response.status_code == 200:
    print("\n✓ Success!")
else:
    print(f"\n✗ Failed with status {approve_response.status_code}")
