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
