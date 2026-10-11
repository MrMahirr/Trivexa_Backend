CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    audience_type TEXT NOT NULL DEFAULT 'PERSONAL',
    department TEXT,
    title VARCHAR(255) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    link TEXT,
    notes TEXT,
    summary TEXT,
    organizer_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_meetings_updated
    BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_meetings_audience_type ON meetings(audience_type);
CREATE INDEX IF NOT EXISTS idx_meetings_department ON meetings(department);
CREATE INDEX IF NOT EXISTS idx_meetings_project_id ON meetings(project_id);
