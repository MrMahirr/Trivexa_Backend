import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE time_entries
      ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS total_pause_minutes INTEGER NOT NULL DEFAULT 0;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE time_entries
      DROP COLUMN IF EXISTS paused_at,
      DROP COLUMN IF EXISTS total_pause_minutes;
  `);
}
