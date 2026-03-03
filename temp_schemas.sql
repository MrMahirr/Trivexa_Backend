CREATE EXTENSION IF NOT EXISTS pgcrypto;
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
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'MEMBER',
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
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'DRAFT',
    budget NUMERIC(12, 2) DEFAULT 0,
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
    role TEXT DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, user_id)
);

CREATE TABLE project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT,
    progress_percent INT DEFAULT 0
);
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
CREATE TABLE expenses (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          description TEXT,
                          amount NUMERIC(12,2),
                          created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE contracts (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           client_id UUID REFERENCES clients(id),
                           title TEXT,
                           start_date DATE,
                           end_date DATE
);

CREATE TABLE contract_approvals (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    contract_id UUID REFERENCES contracts(id),
                                    approved_by UUID REFERENCES users(id),
                                    approved_at TIMESTAMPTZ
);

CREATE TABLE contract_reminders (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    contract_id UUID REFERENCES contracts(id),
                                    remind_at DATE
);
CREATE TABLE meetings (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          project_id UUID REFERENCES projects(id),
                          scheduled_at TIMESTAMPTZ,
                          notes TEXT
);

CREATE TABLE meeting_participants (
                                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                      meeting_id UUID REFERENCES meetings(id),
                                      user_id UUID REFERENCES users(id)
);
CREATE TABLE notifications (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               user_id UUID REFERENCES users(id),
                               message TEXT,
                               is_read BOOLEAN DEFAULT false,
                               created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notification_preferences (
                                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                          user_id UUID REFERENCES users(id),
                                          email_enabled BOOLEAN DEFAULT true
);
CREATE TABLE files (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       owner_id UUID,
                       owner_type TEXT,
                       file_path TEXT,
                       uploaded_at TIMESTAMPTZ DEFAULT now()
);
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
