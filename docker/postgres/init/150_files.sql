CREATE TYPE file_entity_type AS ENUM ('CONTRACT', 'INVOICE', 'PROJECT', 'TICKET', 'EXPENSE');

CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- Local path or Object Storage Key
    mime_type VARCHAR(100),
    size BIGINT,
    entity_type file_entity_type,
    entity_id UUID,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_files_entity ON files(entity_type, entity_id);
