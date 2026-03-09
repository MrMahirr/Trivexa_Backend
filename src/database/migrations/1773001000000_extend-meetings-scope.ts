import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'meetings'
      ) THEN
        ALTER TABLE meetings
          ADD COLUMN IF NOT EXISTS summary TEXT,
          ADD COLUMN IF NOT EXISTS audience_type TEXT NOT NULL DEFAULT 'PERSONAL',
          ADD COLUMN IF NOT EXISTS department TEXT;

        CREATE INDEX IF NOT EXISTS idx_meetings_audience_type ON meetings(audience_type);
        CREATE INDEX IF NOT EXISTS idx_meetings_department ON meetings(department);
        CREATE INDEX IF NOT EXISTS idx_meetings_project_id ON meetings(project_id);
      END IF;
    END
    $$;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'meetings'
      ) THEN
        DROP INDEX IF EXISTS idx_meetings_audience_type;
        DROP INDEX IF EXISTS idx_meetings_department;
        DROP INDEX IF EXISTS idx_meetings_project_id;

        ALTER TABLE meetings
          DROP COLUMN IF EXISTS department,
          DROP COLUMN IF EXISTS audience_type,
          DROP COLUMN IF EXISTS summary;
      END IF;
    END
    $$;
  `);
}

