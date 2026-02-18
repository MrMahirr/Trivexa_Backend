-- 1. Ledger Accounts (Chart of Accounts)
CREATE TYPE account_type AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

CREATE TABLE ledger_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type account_type NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Chart of Accounts (Examples)
INSERT INTO ledger_accounts (code, name, type) VALUES
('100', 'Cash', 'ASSET'),
('120', 'Accounts Receivable', 'ASSET'),
('320', 'Accounts Payable', 'LIABILITY'),
('600', 'Sales Revenue', 'REVENUE'),
('770', 'General Expenses', 'EXPENSE');

-- 2. Ledger Entries (Journal Entries)
CREATE TYPE entry_type AS ENUM ('DEBIT', 'CREDIT');

CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL, -- Grouping for double-entry sets
    account_id UUID NOT NULL REFERENCES ledger_accounts(id),
    amount DECIMAL(15, 2) NOT NULL,
    type entry_type NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reference_type VARCHAR(50), -- e.g., 'INVOICE', 'PAYMENT'
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ledger_entries_transaction_id ON ledger_entries(transaction_id);
CREATE INDEX idx_ledger_entries_account_id ON ledger_entries(account_id);
CREATE INDEX idx_ledger_entries_reference ON ledger_entries(reference_type, reference_id);
