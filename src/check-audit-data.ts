import { Pool } from 'pg';

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
    const res = await client.query(`
      SELECT id, action, resource, new_data, old_data 
      FROM audit_logs 
      ORDER BY created_at DESC 
      LIMIT 10;
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e: any) {
    console.error('Error:', e.message);
  } finally {
    client.release();
    pool.end();
  }
}
run();
