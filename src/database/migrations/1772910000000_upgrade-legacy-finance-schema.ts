import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'invoices'
      ) THEN
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5,2) DEFAULT 0;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12,2) DEFAULT 0;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total NUMERIC(12,2);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS issue_date DATE;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
        ALTER TABLE invoices ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'total_amount'
        ) THEN
          UPDATE invoices
          SET total = COALESCE(total, total_amount, 0)
          WHERE total IS NULL;

          UPDATE invoices
          SET subtotal = COALESCE(subtotal, total, total_amount, 0)
          WHERE subtotal IS NULL;
        ELSE
          UPDATE invoices
          SET total = COALESCE(total, 0)
          WHERE total IS NULL;

          UPDATE invoices
          SET subtotal = COALESCE(subtotal, total, 0)
          WHERE subtotal IS NULL;
        END IF;

        UPDATE invoices
        SET tax_rate = COALESCE(tax_rate, 0)
        WHERE tax_rate IS NULL;

        UPDATE invoices
        SET tax_amount = COALESCE(tax_amount, 0)
        WHERE tax_amount IS NULL;

        UPDATE invoices
        SET issue_date = COALESCE(issue_date, created_at::date, CURRENT_DATE)
        WHERE issue_date IS NULL;

        UPDATE invoices
        SET status = 'SENT'
        WHERE status = 'ISSUED';

        UPDATE invoices
        SET invoice_number = 'INV-LEGACY-' || SUBSTRING(id::text, 1, 8)
        WHERE invoice_number IS NULL OR BTRIM(invoice_number) = '';

        ALTER TABLE invoices ALTER COLUMN invoice_number SET NOT NULL;
        ALTER TABLE invoices ALTER COLUMN subtotal SET NOT NULL;
        ALTER TABLE invoices ALTER COLUMN tax_rate SET NOT NULL;
        ALTER TABLE invoices ALTER COLUMN tax_amount SET NOT NULL;
        ALTER TABLE invoices ALTER COLUMN total SET NOT NULL;
        ALTER TABLE invoices ALTER COLUMN issue_date SET NOT NULL;
        ALTER TABLE invoices ALTER COLUMN issue_date SET DEFAULT CURRENT_DATE;
        ALTER TABLE invoices ALTER COLUMN status SET DEFAULT 'DRAFT';
        ALTER TABLE invoices ALTER COLUMN updated_at SET DEFAULT now();

        CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_invoice_number_unique
          ON invoices(invoice_number);
        CREATE INDEX IF NOT EXISTS idx_invoices_project_id
          ON invoices(project_id);

        DROP TRIGGER IF EXISTS trg_invoice_status ON invoices;
        DROP TRIGGER IF EXISTS trg_invoices_updated ON invoices;
        CREATE TRIGGER trg_invoices_updated
          BEFORE UPDATE ON invoices
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'invoice_items'
      ) THEN
        ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS quantity NUMERIC(10,2) DEFAULT 1;
        ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2) DEFAULT 0;
        ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS total NUMERIC(12,2) DEFAULT 0;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'invoice_items' AND column_name = 'amount'
        ) THEN
          UPDATE invoice_items
          SET quantity = COALESCE(quantity, 1),
              unit_price = COALESCE(unit_price, amount, 0),
              total = COALESCE(total, amount, 0)
          WHERE quantity IS NULL OR unit_price IS NULL OR total IS NULL;
        ELSE
          UPDATE invoice_items
          SET quantity = COALESCE(quantity, 1),
              unit_price = COALESCE(unit_price, 0),
              total = COALESCE(total, unit_price * quantity, 0)
          WHERE quantity IS NULL OR unit_price IS NULL OR total IS NULL;
        END IF;

        ALTER TABLE invoice_items ALTER COLUMN quantity SET NOT NULL;
        ALTER TABLE invoice_items ALTER COLUMN unit_price SET NOT NULL;
        ALTER TABLE invoice_items ALTER COLUMN total SET NOT NULL;
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'payments'
      ) THEN
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_date DATE;
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference TEXT;
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES users(id);

        UPDATE payments
        SET payment_date = COALESCE(payment_date, created_at::date, CURRENT_DATE)
        WHERE payment_date IS NULL;

        UPDATE payments
        SET method = COALESCE(NULLIF(method, ''), 'OTHER')
        WHERE method IS NULL OR method = '';

        ALTER TABLE payments ALTER COLUMN payment_date SET NOT NULL;
        ALTER TABLE payments ALTER COLUMN payment_date SET DEFAULT CURRENT_DATE;
        ALTER TABLE payments ALTER COLUMN method SET NOT NULL;
      END IF;
    END
    $$;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    -- Intentionally no-op: this migration upgrades legacy finance schema in place.
  `);
}
