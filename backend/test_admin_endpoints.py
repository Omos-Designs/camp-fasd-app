import requests

# Login as admin
print("Testing admin endpoints...")
print("=" * 50)

login_response = requests.post(
    'http://localhost:8000/api/auth/login',
    json={'email': 'admin@fasdcamp.org', 'password': 'password123'}
)

if login_response.status_code == 200:
    token = login_response.json()['access_token']
    print(f'✓ Login successful')

    # Try to get applications
    apps_response = requests.get(
        'http://localhost:8000/api/applications/admin/all',
        headers={'Authorization': f'Bearer {token}'}
    )

    if apps_response.status_code == 200:
        apps = apps_response.json()
        print(f'✓ Got {len(apps)} applications')

        if len(apps) > 0:
            app_id = apps[0]['id']
            print(f'\nTesting with application: {app_id}')
            print("=" * 50)

            # Test getting notes
            print("\n1. Testing GET /api/admin/applications/{id}/notes")
            notes_response = requests.get(
                f'http://localhost:8000/api/admin/applications/{app_id}/notes',
                headers={'Authorization': f'Bearer {token}'}
            )
            print(f'   Status: {notes_response.status_code}')
            if notes_response.status_code == 200:
                print(f'   ✓ Success! Notes: {len(notes_response.json())}')
            else:
                print(f'   ✗ Error: {notes_response.text}')

            # Test creating a note
            print("\n2. Testing POST /api/admin/applications/{id}/notes")
            create_note_response = requests.post(
                f'http://localhost:8000/api/admin/applications/{app_id}/notes',
                headers={
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                },
                json={'note': 'Test note from API test'}
            )
            print(f'   Status: {create_note_response.status_code}')
            if create_note_response.status_code == 200:
                print(f'   ✓ Success! Note created')
            else:
                print(f'   ✗ Error: {create_note_response.text}')

            # Test approve endpoint
            print("\n3. Testing POST /api/admin/applications/{id}/approve")
            approve_response = requests.post(
                f'http://localhost:8000/api/admin/applications/{app_id}/approve',
                headers={'Authorization': f'Bearer {token}'}
            )
            print(f'   Status: {approve_response.status_code}')
            if approve_response.status_code == 200:
                print(f'   ✓ Success! {approve_response.json()}')
            else:
                print(f'   ✗ Error: {approve_response.text}')
        else:
            print('✗ No applications found to test with')
    else:
        print(f'✗ Failed to get applications: {apps_response.status_code}')
        print(f'   Error: {apps_response.text}')
else:
    print(f'✗ Login failed: {login_response.status_code}')
    print(f'   Error: {login_response.text}')
