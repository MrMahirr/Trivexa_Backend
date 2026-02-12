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
