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
