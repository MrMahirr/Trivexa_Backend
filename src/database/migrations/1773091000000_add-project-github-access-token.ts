import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'project_github_integrations'
      ) THEN
        ALTER TABLE project_github_integrations
          ADD COLUMN IF NOT EXISTS access_token TEXT;
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
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'project_github_integrations'
      ) THEN
        ALTER TABLE project_github_integrations
          DROP COLUMN IF EXISTS access_token;
      END IF;
    END
    $$;
  `);
}

