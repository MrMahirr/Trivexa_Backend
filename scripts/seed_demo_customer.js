const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DEMO_NAME || `${process.env.DB_NAME}_demo`,
});

async function run() {
  const passwordHash = await bcrypt.hash('password123', 10);
  try {
    const resClient = await pool.query(`INSERT INTO clients (company_name, contact_person, email, phone, address) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email RETURNING id;`, ['Demo Müşteri Ltd. Şti.', 'Ahmet Demo', 'customer@demo.com', '555-555-5555', 'Demo Sokak No:123']);
    const clientId = resClient.rows[0].id;
    
    await pool.query(`INSERT INTO client_users (client_id, email, password_hash, force_password_change) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash`, [clientId, 'customer@demo.com', passwordHash, false]);
    console.log('Demo müşteri eklendi: customer@demo.com');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
