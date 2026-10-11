import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DO $$
    DECLARE
      v_admin_id UUID;
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'payments'
      ) THEN
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'recorded_by'
        ) THEN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'created_by'
          ) THEN
            UPDATE payments p
            SET recorded_by = i.created_by
            FROM invoices i
            WHERE p.invoice_id = i.id
              AND p.recorded_by IS NULL
              AND i.created_by IS NOT NULL;
          END IF;

          SELECT id INTO v_admin_id
          FROM users
          WHERE role = 'ADMIN'
          ORDER BY created_at ASC
          LIMIT 1;

          IF v_admin_id IS NOT NULL THEN
            UPDATE payments
            SET recorded_by = v_admin_id
            WHERE recorded_by IS NULL;
          END IF;
        END IF;
      END IF;
    END
    $$;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    -- no-op (data backfill is intentionally irreversible)
  `);
}
