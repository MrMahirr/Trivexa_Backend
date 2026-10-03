import type { MigrationBuilder } from 'node-pg-migrate';
import * as fs from 'fs';
import * as path from 'path';

export async function up(pgm: MigrationBuilder): Promise<void> {
  const sql = fs.readFileSync(
    path.join(
      path.join(process.cwd(), 'src', 'database', 'migrations'),
      'sql',
      '1771245000000_create_contracts_meetings_files_up.sql',
    ),
    'utf8',
  );
  pgm.sql(sql);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  const sql = fs.readFileSync(
    path.join(
      path.join(process.cwd(), 'src', 'database', 'migrations'),
      'sql',
      '1771245000000_create_contracts_meetings_files_down.sql',
    ),
    'utf8',
  );
  pgm.sql(sql);
}
