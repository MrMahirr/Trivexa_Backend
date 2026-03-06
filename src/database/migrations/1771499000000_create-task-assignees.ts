import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        CREATE TABLE IF NOT EXISTS task_assignees (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE(task_id, user_id)
        );

        CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON task_assignees(task_id);
        CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id ON task_assignees(user_id);

        INSERT INTO task_assignees (task_id, user_id)
        SELECT t.id, t.assignee_id
        FROM tasks t
        WHERE t.assignee_id IS NOT NULL
        ON CONFLICT (task_id, user_id) DO NOTHING;
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        DROP TABLE IF EXISTS task_assignees;
    `);
}
