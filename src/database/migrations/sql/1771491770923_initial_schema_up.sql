-- File: 001_extensions.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- File: 010_helper_functions.sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
  NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.paid_amount >= NEW.total_amount THEN
    NEW.status = 'PAID';
  ELSIF NEW.due_date < CURRENT_DATE AND NEW.paid_amount < NEW.total_amount THEN
    NEW.status = 'OVERDUE';
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- File: 020_core_users.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'DEVELOPER',
    department TEXT DEFAULT 'MANAGEMENT',
    is_active BOOLEAN DEFAULT true,
    force_password_change BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission TEXT NOT NULL,
    UNIQUE(user_id, permission)
);


-- File: 030_auth_security.sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- File: 040_clients.sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_clients_updated
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE client_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT
);


-- File: 050_client_portal.sql
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


-- File: 060_projects.sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'PLANNING',
    budget DECIMAL(10, 2) DEFAULT 0,
    start_date DATE,
    deadline DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_projects_updated
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'DEVELOPER',
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, user_id)
);

CREATE TABLE project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT,
    progress_percent INT DEFAULT 0
);


-- File: 070_project_tasks.sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'TODO',
    priority TEXT DEFAULT 'MEDIUM',
    assignee_id UUID REFERENCES users(id),
    due_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_tasks_updated
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on UUID REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE(task_id, depends_on)
);

CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- File: 080_time_tracking.sql
CREATE TABLE time_entries (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id UUID REFERENCES users(id),
                              project_id UUID REFERENCES projects(id),
                              task_id UUID REFERENCES tasks(id),
                              start_time TIMESTAMPTZ,
                              end_time TIMESTAMPTZ,
                              duration_minutes INT,
                              description TEXT,
                              is_manual BOOLEAN DEFAULT false,
                              approved BOOLEAN DEFAULT false,
                              created_at TIMESTAMPTZ DEFAULT now(),
                              updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_time_duration
    BEFORE INSERT OR UPDATE ON time_entries
                         FOR EACH ROW EXECUTE FUNCTION calculate_time_entry_duration();

CREATE TRIGGER trg_time_entries_updated
    BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- File: 085_tickets.sql
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'SUPPORT',
    status TEXT NOT NULL DEFAULT 'OPEN',
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    created_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_tickets_updated
    BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- File: 090_invoicing.sql
CREATE TABLE invoices (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          client_id UUID REFERENCES clients(id),
                          total_amount NUMERIC(12,2),
                          paid_amount NUMERIC(12,2) DEFAULT 0,
                          status TEXT DEFAULT 'ISSUED',
                          due_date DATE,
                          created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_invoice_status
    BEFORE INSERT OR UPDATE ON invoices
                         FOR EACH ROW EXECUTE FUNCTION update_invoice_status();

CREATE TABLE invoice_items (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
                               description TEXT,
                               amount NUMERIC(12,2)
);


-- File: 100_payments_ledger.sql
CREATE TABLE payments (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          invoice_id UUID REFERENCES invoices(id),
                          amount NUMERIC(12,2),
                          method TEXT,
                          created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ledger_entries (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                reference TEXT,
                                amount NUMERIC(12,2),
                                entry_type TEXT,
                                created_at TIMESTAMPTZ DEFAULT now()
);


-- File: 110_expenses.sql
CREATE TABLE expenses (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          description TEXT,
                          amount NUMERIC(12,2),
                          created_at TIMESTAMPTZ DEFAULT now()
);


-- File: 120_contracts.sql
DROP TABLE IF EXISTS contract_reminders CASCADE;
DROP TABLE IF EXISTS contract_approvals CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TYPE IF EXISTS contract_status;

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


-- File: 130_meetings.sql
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


-- File: 140_notifications.sql
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);


-- File: 150_files.sql
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


-- File: 160_audit_system_logs.sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);


-- File: 170_performance_indexes.sql
-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Time Entries
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);

-- Project Members
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);


-- File: 900_seed_data.sql
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
