import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

export class TestContainer {
    private container: StartedPostgreSqlContainer;
    private pool: Pool;

    async start() {
        try {
            console.log('Starting PostgreSQL container...');
            this.container = await new PostgreSqlContainer('postgres:latest')
                .withDatabase('trivexa_test')
                .withUsername('postgres')
                .withPassword('postgres')
                .withStartupTimeout(120000)
                .start();
            console.log('PostgreSQL container started.');

            this.pool = new Pool({
                connectionString: this.container.getConnectionUri(),
            });

            await this.runMigrations();
        } catch (error) {
            console.log('TestContainer start failed FULL ERROR:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            throw error;
        }
    }

    async stop() {
        await this.pool.end();
        await this.container.stop();
    }

    getPool(): Pool {
        return this.pool;
    }

    private async runMigrations() {
        const migrationsDir = path.join(__dirname, '../database/migrations/sql');
        console.log(`Running migrations from: ${migrationsDir}`);

        // Order is important due to dependencies
        const files = [
            '1771491770923_initial_schema_up.sql', // Base schema (Users, Clients, Projects, Finance, Contracts, etc.)
            // '1771241568895_create-finance-tables_up.sql', // Included in initial_schema
            // '1771243216602_create-ledger-tables_up.sql', // Included in initial_schema
            // '1771245000000_create_contracts_meetings_files_up.sql' // Included in initial_schema
        ];

        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            for (const file of files) {
                const filePath = path.join(migrationsDir, file);
                console.log(`Applying migration: ${file}`);
                if (fs.existsSync(filePath)) {
                    const sql = fs.readFileSync(filePath, 'utf8');
                    await client.query(sql);
                } else {
                    console.error(`Migration file not found: ${filePath}`);
                    throw new Error(`Migration file not found: ${filePath}`);
                }
            }
            await client.query('COMMIT');
        } catch (error) {
            console.error('Migration failed:', error);
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
