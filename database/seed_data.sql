-- Insert sample patients
INSERT INTO patients (id, name, age, gender, phone, village, address, medical_history, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Ramesh Kumar', 45, 'male', '+919876543210', 'Dharavi', 'House No. 123, Dharavi, Mumbai', '{"allergies": ["penicillin"], "chronic_conditions": ["diabetes"]}', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'Sunita Devi', 32, 'female', '+919876543211', 'Kurla', 'Plot No. 456, Kurla Village, Mumbai', '{"allergies": [], "chronic_conditions": ["hypertension"]}', NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'Arjun Singh', 28, 'male', '+919876543212', 'Andheri', 'Block B, Andheri East, Mumbai', '{"allergies": [], "chronic_conditions": []}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample users with hashed passwords
-- Note: These are bcrypt hashes of 'password123' for demonstration
-- In production, use proper password hashing
INSERT INTO users (id, username, email, password_hash, role, full_name, phone, is_active, created_at, updated_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'asha_worker', 'asha@arogya.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEmaUu', 'asha_worker', 'Priya Sharma', '+919876543220', true, NOW(), NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'doctor', 'doctor@arogya.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEmaUu', 'doctor', 'Dr. Rajesh Verma', '+919876543221', true, NOW(), NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'admin', 'admin@arogya.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEmaUu', 'admin', 'Admin User', '+919876543222', true, NOW(), NOW())
ON CONFLICT (username) DO NOTHING;
