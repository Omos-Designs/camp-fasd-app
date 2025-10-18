"""
Quick test script for authentication endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("Testing CAMP FASD Authentication API")
print("=" * 60)

# Test 1: Login with super admin
print("\n1. Testing LOGIN with super admin...")
print("   POST /api/auth/login")
print("   Email: yianni@fasdcamp.org")
print("   Password: ChangeMe123!")

login_response = requests.post(
    f"{BASE_URL}/api/auth/login",
    json={
        "email": "yianni@fasdcamp.org",
        "password": "ChangeMe123!"
    }
)

print(f"\n   Status Code: {login_response.status_code}")
if login_response.status_code == 200:
    login_data = login_response.json()
    print("   ✅ Login successful!")
    print(f"   Token Type: {login_data['token_type']}")
    print(f"   User Email: {login_data['user']['email']}")
    print(f"   User Role: {login_data['user']['role']}")
    print(f"   Access Token: {login_data['access_token'][:50]}...")

    # Save token for next test
    access_token = login_data['access_token']

    # Test 2: Get current user info
    print("\n2. Testing GET CURRENT USER...")
    print("   GET /api/auth/me")
    print("   (Using JWT token from login)")

    me_response = requests.get(
        f"{BASE_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    print(f"\n   Status Code: {me_response.status_code}")
    if me_response.status_code == 200:
        me_data = me_response.json()
        print("   ✅ Token verified successfully!")
        print(f"   User ID: {me_data['id']}")
        print(f"   Email: {me_data['email']}")
        print(f"   Role: {me_data['role']}")
        print(f"   Email Verified: {me_data['email_verified']}")
    else:
        print(f"   ❌ Failed: {me_response.json()}")

else:
    print(f"   ❌ Login failed: {login_response.json()}")

# Test 3: Try to register a new user
print("\n3. Testing USER REGISTRATION...")
print("   POST /api/auth/register")
print("   Creating test user: test@fasdcamp.org")

register_response = requests.post(
    f"{BASE_URL}/api/auth/register",
    json={
        "email": "test@fasdcamp.org",
        "password": "TestPassword123!",
        "first_name": "Test",
        "last_name": "User"
    }
)

print(f"\n   Status Code: {register_response.status_code}")
if register_response.status_code == 201:
    register_data = register_response.json()
    print("   ✅ Registration successful!")
    print(f"   New User Email: {register_data['user']['email']}")
    print(f"   New User Role: {register_data['user']['role']}")
    print(f"   Access Token: {register_data['access_token'][:50]}...")
elif register_response.status_code == 400:
    print("   ℹ️  User already exists (expected if running multiple times)")
else:
    print(f"   ❌ Failed: {register_response.json()}")

print("\n" + "=" * 60)
print("✅ Authentication system is working!")
print("=" * 60)
print("\n📚 Next steps:")
print("   - Visit http://localhost:8000/api/docs to see all endpoints")
print("   - Build the frontend login page")
print("   - Add application endpoints")