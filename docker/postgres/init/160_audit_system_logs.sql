CREATE TABLE audit_logs (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            table_name TEXT,
                            record_id UUID,
                            action TEXT,
                            old_data JSONB,
                            new_data JSONB,
                            created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE system_logs (
                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             level TEXT,
                             message TEXT,
                             created_at TIMESTAMPTZ DEFAULT now()
);
