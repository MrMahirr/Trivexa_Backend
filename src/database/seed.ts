import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function main() {
    const client = await pool.connect();
    try {
        console.log('Seeding database with extended data (10+ items per table)...');
        await client.query('BEGIN');

        // Helpers
        const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
        const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

        // 1. Create Users (15 users)
        console.log('Creating users...');
        const passwordHash = await bcrypt.hash('password123', 10);
        const roles = ['ADMIN', 'MANAGER', 'MEMBER', 'MEMBER', 'MEMBER'];
        const userIds: string[] = [];

        // Always ensure specific test users exist
        const fixedUsers = [
            { email: 'admin@trivexa.com', role: 'ADMIN', first: 'Admin', last: 'User' },
            { email: 'manager@trivexa.com', role: 'MANAGER', first: 'John', last: 'Manager' },
            { email: 'dev@trivexa.com', role: 'MEMBER', first: 'Jane', last: 'Dev' }
        ];

        for (const u of fixedUsers) {
            const res = await client.query(`
                INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
                RETURNING id;
            `, [u.email, passwordHash, u.first, u.last, u.role, true]);
            userIds.push(res.rows[0].id);
        }

        // Generate random users
        for (let i = 1; i <= 12; i++) {
            const role = getRandomItem(roles);
            const res = await client.query(`
                INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (email) DO NOTHING
                RETURNING id;
            `, [`user${i}@trivexa.com`, passwordHash, `User${i}`, `Test`, role, true]);
            if (res.rows[0]) userIds.push(res.rows[0].id);
        }

        // 2. Create Clients (15 clients)
        console.log('Creating clients...');
        const clientIds: string[] = [];
        for (let i = 1; i <= 15; i++) {
            const res = await client.query(`
                INSERT INTO clients (company_name, contact_person, email, phone, address)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (email) DO NOTHING
                RETURNING id;
            `, [`Client Company ${i}`, `Contact ${i}`, `contact${i}@client.com`, `+1555000${i.toString().padStart(4, '0')}`, `Address ${i}`]);
            if (res.rows[0]) clientIds.push(res.rows[0].id);
        }

        // 3. Create Projects (20 projects)
        console.log('Creating projects...');
        const projectStatuses = ['DRAFT', 'PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
        const projectIds: string[] = [];

        for (let i = 1; i <= 20; i++) {
            const ownerId = getRandomItem(userIds);
            const clientId = getRandomItem(clientIds);
            const status = getRandomItem(projectStatuses);

            const res = await client.query(`
                INSERT INTO projects (name, client_id, status, budget, created_by, start_date, deadline, description)
                VALUES ($1, $2, $3, $4, $5, NOW(), NOW() + INTERVAL '${getRandomInt(1, 12)} months', $6)
                RETURNING id;
            `, [`Project ${i} - ${status}`, clientId, status, getRandomInt(5000, 500000), ownerId, `Description for project ${i}`]);

            const projectId = res.rows[0].id;
            projectIds.push(projectId);

            // Add 1-5 members per project
            const memberCount = getRandomInt(1, 5);
            for (let m = 0; m < memberCount; m++) {
                await client.query(`
                    INSERT INTO project_members (project_id, user_id, role)
                    VALUES ($1, $2, $3)
                    ON CONFLICT DO NOTHING;
                `, [projectId, getRandomItem(userIds), m === 0 ? 'PROJECT_LEAD' : 'MEMBER']);
            }
        }

        // 4. Create Tasks (50 tasks)
        console.log('Creating tasks...');
        const taskStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
        const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

        for (let i = 1; i <= 50; i++) {
            const projectId = getRandomItem(projectIds);
            const assigneeId = getRandomItem(userIds);

            await client.query(`
                INSERT INTO tasks (title, project_id, status, priority, assignee_id, created_by, due_date)
                VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '${getRandomInt(1, 30)} days')
            `, [`Task ${i}`, projectId, getRandomItem(taskStatuses), getRandomItem(priorities), assigneeId, userIds[0]]);
        }

        // 5. Create Invoices (20 invoices) & Items
        console.log('Creating invoices...');
        const invoiceStatuses = ['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED'];

        for (let i = 1; i <= 20; i++) {
            const clientId = getRandomItem(clientIds);
            const amount = getRandomInt(100, 5000);
            const status = getRandomItem(invoiceStatuses);

            const res = await client.query(`
                INSERT INTO invoices (client_id, total_amount, paid_amount, status, due_date)
                VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')
                RETURNING id;
            `, [clientId, amount, status === 'PAID' ? amount : 0, status]);

            const invoiceId = res.rows[0].id;

            // Invoice Items
            await client.query(`
                INSERT INTO invoice_items (invoice_id, description, amount)
                VALUES ($1, $2, $3)
            `, [invoiceId, `Service Item for Invoice ${i}`, amount]);

            // Payments for paid invoices
            if (status === 'PAID') {
                await client.query(`
                    INSERT INTO payments (invoice_id, amount, method)
                    VALUES ($1, $2, 'BANK_TRANSFER')
                `, [invoiceId, amount]);
            }
        }

        // 6. Create Contracts (15 contracts)
        console.log('Creating contracts...');
        const contractStatuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SIGNED', 'EXPIRED'];

        for (let i = 1; i <= 15; i++) {
            await client.query(`
                INSERT INTO contracts (client_id, title, status, start_date, end_date, value, created_by)
                VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '1 year', $4, $5)
            `, [getRandomItem(clientIds), `Contract ${i}`, getRandomItem(contractStatuses), getRandomInt(10000, 100000), userIds[0]]);
        }

        // 7. Create Tickets (15 tickets)
        console.log('Creating tickets...');
        const ticketStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
        const ticketTypes = ['SUPPORT', 'BUG', 'FEATURE_REQUEST'];

        for (let i = 1; i <= 15; i++) {
            await client.query(`
                INSERT INTO tickets (subject, description, type, status, priority, created_by, assigned_to)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [`Ticket ${i}`, `Issue description ${i}`, getRandomItem(ticketTypes), getRandomItem(ticketStatuses), getRandomItem(priorities), getRandomItem(userIds), getRandomItem(userIds)]);
        }

        // 8. Create Expenses (20 expenses)
        console.log('Creating expenses...');
        for (let i = 1; i <= 20; i++) {
            await client.query(`
                INSERT INTO expenses (description, amount, created_at)
                VALUES ($1, $2, NOW() - INTERVAL '${getRandomInt(0, 30)} days')
            `, [`Office Expense ${i}`, getRandomInt(10, 500)]);
        }

        await client.query('COMMIT');
        console.log('Seeding complete! Database populated with 10+ records per table.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Seeding failed:', e);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
