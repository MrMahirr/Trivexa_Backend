import type { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = fs.readFileSync(
    path.join(__dirname, 'sql', '1771241568895_create-finance-tables_up.sql'),
    'utf8',
  );
  pgm.sql(sql);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = fs.readFileSync(
    path.join(__dirname, 'sql', '1771241568895_create-finance-tables_down.sql'),
    'utf8',
  );
  pgm.sql(sql);
}

