CREATE TABLE department_tasks (
                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
                                  title TEXT NOT NULL,
                                  status TEXT DEFAULT 'OPEN',
                                  tags JSONB,
                                  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE task_dependencies (
                                   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   task_id UUID REFERENCES department_tasks(id),
                                   depends_on UUID REFERENCES department_tasks(id)
);

CREATE TABLE task_comments (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               task_id UUID REFERENCES department_tasks(id),
                               user_id UUID REFERENCES users(id),
                               comment TEXT,
                               created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE task_templates (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                name TEXT,
                                tasks JSONB
);
