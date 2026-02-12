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
