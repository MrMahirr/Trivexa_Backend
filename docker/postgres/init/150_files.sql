CREATE TABLE files (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       owner_id UUID,
                       owner_type TEXT,
                       file_path TEXT,
                       uploaded_at TIMESTAMPTZ DEFAULT now()
);
