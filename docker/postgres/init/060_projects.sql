CREATE TABLE projects (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          client_id UUID REFERENCES clients(id),
                          name TEXT NOT NULL,
                          status TEXT DEFAULT 'ACTIVE',
                          start_date DATE,
                          end_date DATE,
                          created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE project_members (
                                 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
                                 user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                                 role TEXT
);

CREATE TABLE project_milestones (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
                                    title TEXT,
                                    progress_percent INT DEFAULT 0
);
