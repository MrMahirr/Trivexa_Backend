import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import * as fs from 'fs';
import * as path from 'path';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = fs.readFileSync(
    path.join(__dirname, 'sql', '1771243216602_create-ledger-tables_up.sql'),
    'utf8',
  );
  pgm.sql(sql);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = fs.readFileSync(
    path.join(__dirname, 'sql', '1771243216602_create-ledger-tables_down.sql'),
    'utf8',
  );
  pgm.sql(sql);
}
