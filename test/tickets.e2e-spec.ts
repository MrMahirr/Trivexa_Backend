import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2eEnvironment } from './helpers/e2e-environment';

describe('Operations: Tickets (E2E)', () => {
    let env: E2eEnvironment;
    let app: INestApplication;
    let adminToken: string;
    let adminUserId: string;
    let createdTicketId: string;

    beforeAll(async () => {
        env = new E2eEnvironment();
        await env.setup();
        app = env.app;

        await env.seeder.seedUser();

        // Login as admin
        const adminRes = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
                email: 'seed@example.com',
                password: 'Password123!',
            });
        adminToken = adminRes.body.accessToken;

        // Get admin user ID
        const usersRes = await request(app.getHttpServer())
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${adminToken}`);

        const adminUser = usersRes.body.data ? usersRes.body.data.find(u => u.email === 'seed@example.com') : usersRes.body.find(u => u.email === 'seed@example.com');
        adminUserId = adminUser.id;
    }, 60000);

    afterAll(async () => {
        await env.teardown();
    });

    it('/tickets (POST) - Create Ticket', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/v1/tickets')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                subject: 'Login Issue',
                description: 'Cannot login to the system',
                type: 'BUG',
                priority: 'HIGH',
            });

        if (res.status !== 201) {
            console.log('Ticket Create Error:', res.body);
        }

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        createdTicketId = res.body.id;
    });

    it('/tickets (GET) - Get All Tickets', async () => {
        const res = await request(app.getHttpServer())
            .get('/api/v1/tickets')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        const data = res.body.data || res.body;
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('/tickets/:id (GET) - Get Ticket by ID', async () => {
        const res = await request(app.getHttpServer())
            .get(`/api/v1/tickets/${createdTicketId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(createdTicketId);
    });

    it('/tickets/:id/status (PATCH) - Update Ticket Status', async () => {
        const res = await request(app.getHttpServer())
            .patch(`/api/v1/tickets/${createdTicketId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'IN_PROGRESS' });

        if (res.status !== 200) {
            console.log('Ticket Update Status Error:', res.body);
        }

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('IN_PROGRESS');
    });

    it('/tickets/:id/assign (PATCH) - Assign Ticket', async () => {
        const res = await request(app.getHttpServer())
            .patch(`/api/v1/tickets/${createdTicketId}/assign`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ assigneeId: adminUserId });

        if (res.status !== 200) {
            console.log('Ticket Assign Error:', res.body);
        }

        expect(res.status).toBe(200);
        expect(res.body.assignedTo).toBe(adminUserId);
    });
});
