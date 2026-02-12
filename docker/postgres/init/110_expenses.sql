CREATE TABLE expenses (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          description TEXT,
                          amount NUMERIC(12,2),
                          created_at TIMESTAMPTZ DEFAULT now()
);
