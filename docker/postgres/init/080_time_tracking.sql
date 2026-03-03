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
