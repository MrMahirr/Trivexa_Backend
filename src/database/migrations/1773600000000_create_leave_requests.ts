import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      department TEXT,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      duration_days INTEGER NOT NULL DEFAULT 1,
      reason TEXT,
      approved_by UUID REFERENCES users(id),
      approved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_start_date ON leave_requests(start_date);

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'leave_requests'
      ) THEN
        CREATE TRIGGER trg_leave_requests_updated
          BEFORE UPDATE ON leave_requests
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END
    $$;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TRIGGER IF EXISTS trg_leave_requests_updated ON leave_requests;
    DROP INDEX IF EXISTS idx_leave_requests_start_date;
    DROP INDEX IF EXISTS idx_leave_requests_status;
    DROP INDEX IF EXISTS idx_leave_requests_user_id;
    DROP TABLE IF EXISTS leave_requests;
  `);
}
