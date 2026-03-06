import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        CREATE TABLE IF NOT EXISTS project_github_integrations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
            repository_url TEXT NOT NULL,
            repository_full_name TEXT NOT NULL,
            created_by UUID REFERENCES users(id),
            updated_by UUID REFERENCES users(id),
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_project_github_integrations_project_id
            ON project_github_integrations(project_id);

        DROP TRIGGER IF EXISTS trg_project_github_integrations_updated ON project_github_integrations;
        CREATE TRIGGER trg_project_github_integrations_updated
            BEFORE UPDATE ON project_github_integrations
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        DROP TRIGGER IF EXISTS trg_project_github_integrations_updated ON project_github_integrations;
        DROP TABLE IF EXISTS project_github_integrations;
    `);
}

