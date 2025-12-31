-- Insert sample patients
INSERT INTO patients (id, name, age, gender, phone, village, district, state, asha_worker_id, language_preference, address, medical_history, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Ramesh Kumar', 45, 'male', '+919876543210', 'Dharavi', 'Mumbai', 'Maharashtra', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'hi', 'House No. 123, Dharavi, Mumbai', '{"allergies": ["penicillin"], "chronic_conditions": ["diabetes"]}', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'Sunita Devi', 32, 'female', '+919876543211', 'Kurla', 'Mumbai', 'Maharashtra', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'hi', 'Plot No. 456, Kurla Village, Mumbai', '{"allergies": [], "chronic_conditions": ["hypertension"]}', NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'Arjun Singh', 28, 'male', '+919876543212', 'Andheri', 'Mumbai', 'Maharashtra', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mr', 'Block B, Andheri East, Mumbai', '{"allergies": [], "chronic_conditions": []}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample users with hashed passwords
-- NOTE: These are demo credentials for development ONLY!
-- All passwords are 'password123' - bcrypt hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEmaUu
-- In production, always use unique, strong passwords with proper hashing!
INSERT INTO users (id, username, email, password_hash, role, full_name, phone, is_active, created_at, updated_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'asha_worker', 'asha@arogya.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEmaUu', 'asha_worker', 'Priya Sharma', '+919876543220', true, NOW(), NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'doctor', 'doctor@arogya.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEmaUu', 'doctor', 'Dr. Rajesh Verma', '+919876543221', true, NOW(), NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'admin', 'admin@arogya.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEmaUu', 'admin', 'Admin User', '+919876543222', true, NOW(), NOW())
ON CONFLICT (username) DO NOTHING;
