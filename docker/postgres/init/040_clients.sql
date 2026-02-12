CREATE TABLE clients (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         name TEXT NOT NULL,
                         email TEXT UNIQUE NOT NULL,
                         phone TEXT,
                         status TEXT DEFAULT 'ACTIVE',
                         created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE client_contacts (
                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
                                 name TEXT,
                                 email TEXT,
                                 phone TEXT
);
