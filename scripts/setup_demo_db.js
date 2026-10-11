const { Client } = require('pg');
const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function setup() {
  const dbName = process.env.DB_DEMO_NAME || `${process.env.DB_NAME}_demo`;
  console.log(`Setting up demo database: ${dbName}...`);

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      console.log(`Creating database ${dbName}...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created successfully.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
  } catch (err) {
    console.error(`Error creating database:`, err);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Run migrations
  console.log(`Running migrations on ${dbName}...`);
  const demoDbUrl = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${dbName}`;
  
  try {
    execSync(`npm run migrate:up`, {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: demoDbUrl }
    });
    console.log(`Migrations completed successfully.`);
  } catch (err) {
    console.error(`Migrations failed.`);
    process.exit(1);
  }

  // Run seed
  console.log(`Running seed on ${dbName}...`);
  try {
    execSync(`npm run seed`, {
      stdio: 'inherit',
      env: { ...process.env, FEATURE_DEMO_MODE: 'true', DB_DEMO_NAME: dbName }
    });
    console.log(`Seed completed successfully.`);
  } catch (err) {
    console.error(`Seed failed.`);
    process.exit(1);
  }
}

setup();
