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
    const auditRes = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'audit_logs';`);
    console.log('--- audit_logs ---');
    auditRes.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

    const userRes = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';`);
    console.log('\n--- users ---');
    userRes.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
  } catch (e: any) {
    console.error('Error:', e.message);
  } finally {
    client.release();
    pool.end();
  }
}
run();
