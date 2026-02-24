import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2eEnvironment } from './helpers/e2e-environment';

describe('Clients System (E2E)', () => {
    let env: E2eEnvironment;
    let app: INestApplication;
    let adminToken: string;
    let createdClientId: string;
    let clientUserId: string;

    beforeAll(async () => {
        env = new E2eEnvironment();
        await env.setup();
        app = env.app;

        await env.seeder.seedUser();

        // Login as admin for tests
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

    const testClient = {
        companyName: 'ACME Corp E2E',
        contactPerson: 'E2E Contact',
        email: 'acme.e2e@example.com',
        phone: '+1234567890',
    };

    it('/clients (POST) - Create Client', () => {
        return request(app.getHttpServer())
            .post('/api/v1/clients')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(testClient)
            .expect(201)
            .expect((res) => {
                expect(res.body.id).toBeDefined();
                expect(res.body.companyName).toBe(testClient.companyName);
                createdClientId = res.body.id;
            });
    });


});
