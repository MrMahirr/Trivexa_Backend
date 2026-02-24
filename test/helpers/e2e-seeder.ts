import { Pool } from 'pg';

export class E2eSeeder {
    constructor(private pool: Pool) { }

    async cleanDatabase() {
        const client = await this.pool.connect();
        try {
            // Disable triggers momentarily, truncate all major tables, then enable
            await client.query(`
        DO $$ DECLARE
            r RECORD;
        BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'pgmigrations') LOOP
                EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" CASCADE;';
            END LOOP;
        END $$;
      `);
        } finally {
            client.release();
        }
    }

    async seedUser(overrides: any = {}) {
        const defaultUser = {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'seed@example.com',
            password: '$2b$10$yzpmg2Hd.kNP2XGQAwXqHuxM9xMNxWul2BUiG.rdstjUGlqAbelT2', // Hash for "Password123!"
            first_name: 'Seed',
            last_name: 'User',
            role: 'ADMIN',
            status: 'ACTIVE',
            ...overrides,
        };

        const client = await this.pool.connect();
        try {
            await client.query(
                `INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    defaultUser.id,
                    defaultUser.email,
                    defaultUser.password,
                    defaultUser.first_name,
                    defaultUser.last_name,
                    defaultUser.role,
                    defaultUser.status === 'ACTIVE' ? true : false,
                ],
            );
        } finally {
            client.release();
        }
        return defaultUser;
    }
}
