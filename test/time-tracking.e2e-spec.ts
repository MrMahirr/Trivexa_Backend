import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2eEnvironment } from './helpers/e2e-environment';

describe('Operations: Time Tracking (E2E)', () => {
    let env: E2eEnvironment;
    let app: INestApplication;
    let adminToken: string;
    let createdTimeEntryId: string;

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
    }, 60000);

    afterAll(async () => {
        await env.teardown();
    });

    it('/time-entries/start (POST) - Start Timer', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/v1/time-entries/start')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ description: 'Working on backend' });

        // Timer started
        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        createdTimeEntryId = res.body.id;
    });

    it('/time-entries/active (GET) - Get Active Timer', async () => {
        const res = await request(app.getHttpServer())
            .get('/api/v1/time-entries/active')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(createdTimeEntryId);
    });

    it('/time-entries/stop (PATCH) - Stop Timer', async () => {
        const res = await request(app.getHttpServer())
            .patch('/api/v1/time-entries/stop')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.endTime).toBeDefined();
    });

    it('/time-entries (POST) - Create Manual Entry', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/v1/time-entries')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                startTime: '2026-02-24T09:00:00.000Z',
                endTime: '2026-02-24T12:00:00.000Z',
                description: 'Manual entry for planning'
            });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
    });

    it('/time-entries (GET) - List Time Entries', async () => {
        const res = await request(app.getHttpServer())
            .get('/api/v1/time-entries')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('/time-entries/:id/approve (PATCH) - Approve Entry', async () => {
        const res = await request(app.getHttpServer())
            .patch(`/api/v1/time-entries/${createdTimeEntryId}/approve`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.approved).toBe(true);
    });
});
