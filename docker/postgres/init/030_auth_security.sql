CREATE TABLE auth_tokens (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                             token TEXT UNIQUE NOT NULL,
                             expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE password_reset_tokens (
                                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                       user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                                       token TEXT UNIQUE NOT NULL,
                                       expires_at TIMESTAMPTZ NOT NULL
);
