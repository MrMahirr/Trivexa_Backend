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
