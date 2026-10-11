import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT,
      platform TEXT NOT NULL,
      objective TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      budget NUMERIC(12, 2) DEFAULT 0,
      owner TEXT,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_campaigns_project_id ON campaigns(project_id);
    CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
    CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON campaigns(platform);
    CREATE INDEX IF NOT EXISTS idx_campaigns_objective ON campaigns(objective);
    CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON campaigns(start_date);
    CREATE INDEX IF NOT EXISTS idx_campaigns_end_date ON campaigns(end_date);

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'campaigns'
      ) THEN
        CREATE TRIGGER trg_campaigns_updated
          BEFORE UPDATE ON campaigns
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END
    $$;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TRIGGER IF EXISTS trg_campaigns_updated ON campaigns;
    DROP INDEX IF EXISTS idx_campaigns_end_date;
    DROP INDEX IF EXISTS idx_campaigns_start_date;
    DROP INDEX IF EXISTS idx_campaigns_objective;
    DROP INDEX IF EXISTS idx_campaigns_platform;
    DROP INDEX IF EXISTS idx_campaigns_status;
    DROP INDEX IF EXISTS idx_campaigns_project_id;
    DROP TABLE IF EXISTS campaigns;
  `);
}
