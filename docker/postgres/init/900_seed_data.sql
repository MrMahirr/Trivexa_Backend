-- Admin user: admin@trivexa.com / admin1234
INSERT INTO users (email, password_hash, first_name, last_name, role, department, is_active, force_password_change)
VALUES (
    'admin@trivexa.com',
    '$2b$12$leKD56IWilzlOYdbFvUtu.8PZ10tLMs.kJlCxwJBTh0J1EGfiR2ui',
    'Admin',
    'User',
    'ADMIN',
    'MANAGEMENT',
    true,
    false
)
ON CONFLICT (email) DO NOTHING;
