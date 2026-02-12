CREATE TABLE time_entries (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id UUID REFERENCES users(id),
                              task_id UUID REFERENCES department_tasks(id),
                              start_time TIMESTAMPTZ,
                              end_time TIMESTAMPTZ,
                              duration_minutes INT
);

CREATE TRIGGER trg_time_duration
    BEFORE INSERT OR UPDATE ON time_entries
                         FOR EACH ROW EXECUTE FUNCTION calculate_time_entry_duration();
