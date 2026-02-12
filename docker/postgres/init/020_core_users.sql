CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email TEXT UNIQUE NOT NULL,
                       password_hash TEXT NOT NULL,
                       role TEXT NOT NULL,
                       department TEXT,
                       is_active BOOLEAN DEFAULT true,
                       created_at TIMESTAMPTZ DEFAULT now(),
                       updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE user_permissions (
                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                                  permission TEXT NOT NULL
);
