CREATE TABLE client_users (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
                              email TEXT UNIQUE NOT NULL,
                              password_hash TEXT NOT NULL,
                              created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE client_access_links (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     client_user_id UUID REFERENCES client_users(id) ON DELETE CASCADE,
                                     token TEXT UNIQUE NOT NULL,
                                     expires_at TIMESTAMPTZ NOT NULL
);
