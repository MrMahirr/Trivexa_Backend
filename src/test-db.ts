import { Pool } from 'pg';
import * as fs from 'fs';

const pool = new Pool({
  host: 'localhost',
  port: 2678,
  database: 'trivexa_db',
  user: 'admin',
  password: 'admin123',
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT id, user_id, start_time, end_time, duration_minutes FROM time_entries ORDER BY start_time DESC LIMIT 5',
    );
    fs.writeFileSync('output.json', JSON.stringify(res.rows, null, 2));
    console.log('Written to output.json');
  } catch (e: any) {
    console.error(e.message);
  } finally {
    client.release();
    pool.end();
  }
}
run();
