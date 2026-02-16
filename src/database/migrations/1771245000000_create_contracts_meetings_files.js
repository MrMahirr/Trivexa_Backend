exports.shorthands = undefined;

exports.up = pgm => {
    // 1. Contracts
    pgm.sql(`
        DROP TABLE IF EXISTS contract_reminders CASCADE;
        DROP TABLE IF EXISTS contract_approvals CASCADE;
        DROP TABLE IF EXISTS contracts CASCADE;

        CREATE TYPE contract_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SIGNED', 'EXPIRED', 'TERMINATED');

        CREATE TABLE contracts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status contract_status NOT NULL DEFAULT 'DRAFT',
            start_date DATE NOT NULL,
            end_date DATE,
            value DECIMAL(15, 2),
            signed_url TEXT,
            created_by UUID REFERENCES users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TRIGGER trg_contracts_updated
            BEFORE UPDATE ON contracts
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // 2. Meetings
    pgm.sql(`
        CREATE TABLE meetings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
            project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
            title VARCHAR(255) NOT NULL,
            date TIMESTAMP WITH TIME ZONE NOT NULL,
            duration_minutes INTEGER DEFAULT 60,
            link TEXT,
            notes TEXT,
            organizer_id UUID REFERENCES users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TRIGGER trg_meetings_updated
            BEFORE UPDATE ON meetings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // 3. Files
    pgm.sql(`
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
    `);
};

exports.down = pgm => {
    pgm.sql(`
        DROP TABLE IF EXISTS files CASCADE;
        DROP TYPE IF EXISTS file_entity_type;
        DROP TABLE IF EXISTS meetings CASCADE;
        DROP TABLE IF EXISTS contracts CASCADE;
        DROP TYPE IF EXISTS contract_status;
    `);
};
