import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'contracts'
      ) THEN
        ALTER TABLE contracts
          ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

        CREATE INDEX IF NOT EXISTS idx_contracts_project_id
          ON contracts(project_id);
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
        WHERE table_schema = 'public' AND table_name = 'contracts'
      ) THEN
        DROP INDEX IF EXISTS idx_contracts_project_id;
        ALTER TABLE contracts DROP COLUMN IF EXISTS project_id;
      END IF;
    END
    $$;
  `);
}

