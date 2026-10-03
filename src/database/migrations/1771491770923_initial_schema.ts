import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import * as fs from 'fs';
import * as path from 'path';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = fs.readFileSync(
    path.join(path.join(process.cwd(), 'src', 'database', 'migrations'), 'sql', '1771491770923_initial_schema_up.sql'),
    'utf8',
  );
  pgm.sql(sql);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = fs.readFileSync(
    path.join(path.join(process.cwd(), 'src', 'database', 'migrations'), 'sql', '1771491770923_initial_schema_down.sql'),
    'utf8',
  );
  pgm.sql(sql);
}
