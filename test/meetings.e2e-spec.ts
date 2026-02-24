import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2eEnvironment } from './helpers/e2e-environment';

describe('Operations: Meetings (E2E)', () => {
    let env: E2eEnvironment;
    let app: INestApplication;
    let adminToken: string;
    let createdMeetingId: string;

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

    it('/meetings (POST) - Create Meeting', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/v1/meetings')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'Project Kickoff',
                date: '2026-03-01T10:00:00Z',
                durationMinutes: 60,
                link: 'https://meet.google.com/abc-defg-hij',
                notes: 'Initial discussion',
            });

        if (res.status !== 201) {
            console.log('Meeting Create Error:', res.body);
        }

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        createdMeetingId = res.body.id;
    });

    it('/meetings (GET) - Get All Meetings', async () => {
        const res = await request(app.getHttpServer())
            .get('/api/v1/meetings')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        const data = res.body.data || res.body;
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('/meetings/:id (GET) - Get Meeting by ID', async () => {
        const res = await request(app.getHttpServer())
            .get(`/api/v1/meetings/${createdMeetingId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(createdMeetingId);
    });
});
