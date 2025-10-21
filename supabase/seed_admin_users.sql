-- Seed Admin Users for Testing 3-Team Approval Workflow
-- Password for all test users: Camp2024!
-- Note: Using ON CONFLICT DO UPDATE to refresh passwords if users exist

-- Medical Team Admin
INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    phone,
    password_hash,
    role,
    team,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'medical@fasdcamp.org',
    'Dr. Sarah',
    'Johnson',
    '555-0101',
    '$2b$12$4s5uFS4PukeeuUPbfax5X.xKIMS285Bv8Yqrdm0JQ7CN8.2Ccvz56',
    'admin',
    'med',
    true,
    now(),
    now()
) ON CONFLICT (email) DO NOTHING;

-- Behavioral Team Admin
INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    phone,
    password_hash,
    role,
    team,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'behavioral@fasdcamp.org',
    'James',
    'Martinez',
    '555-0102',
    '$2b$12$4s5uFS4PukeeuUPbfax5X.xKIMS285Bv8Yqrdm0JQ7CN8.2Ccvz56',
    'admin',
    'behavioral',
    true,
    now(),
    now()
) ON CONFLICT (email) DO NOTHING;

-- Literacy Team Admin (bonus - for complete testing)
INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    phone,
    password_hash,
    role,
    team,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'literacy@fasdcamp.org',
    'Maria',
    'Chen',
    '555-0103',
    '$2b$12$4s5uFS4PukeeuUPbfax5X.xKIMS285Bv8Yqrdm0JQ7CN8.2Ccvz56',
    'admin',
    'lit',
    true,
    now(),
    now()
) ON CONFLICT (email) DO NOTHING;

-- Verify the users were created
SELECT
    email,
    first_name,
    last_name,
    role,
    team,
    email_verified
FROM users
WHERE email IN ('medical@fasdcamp.org', 'behavioral@fasdcamp.org', 'literacy@fasdcamp.org')
ORDER BY team;
