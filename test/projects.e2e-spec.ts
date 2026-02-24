import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2eEnvironment } from './helpers/e2e-environment';

describe('Operations: Projects (E2E)', () => {
    let env: E2eEnvironment;
    let app: INestApplication;
    let adminToken: string;
    let createdProjectId: string;
    let createdClientId: string;

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

        // Create a Client to use in Project Creation
        const clientRes = await request(app.getHttpServer())
            .post('/api/v1/clients')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                companyName: 'Project Test Client',
                contactPerson: 'Project Contact',
                email: 'project_test@example.com',
                phone: '+1234567890',
            });
        createdClientId = clientRes.body.id;
    }, 60000);

    afterAll(async () => {
        await env.teardown();
    });

    const testProject = {
        name: 'Website Redesign',
        description: 'New corporate website redesign project',
        startDate: '2026-03-01T00:00:00.000Z',
        endDate: '2026-06-01T00:00:00.000Z',
        budget: 50000.00
    };

    it('/projects (POST) - Create Project', () => {
        return request(app.getHttpServer())
            .post('/api/v1/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                ...testProject,
                clientId: createdClientId
            })
            .expect(201)
            .expect((res) => {
                expect(res.body.id).toBeDefined();
                expect(res.body.name).toBe(testProject.name);
                expect(res.body.clientId).toBe(createdClientId);
                createdProjectId = res.body.id;
            });
    });

    it('/projects (GET) - List Projects', () => {
        return request(app.getHttpServer())
            .get('/api/v1/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.some((p: any) => p.id === createdProjectId)).toBe(true);
            });
    });

    it('/projects/:id (GET) - Get Project Detail', () => {
        return request(app.getHttpServer())
            .get(`/api/v1/projects/${createdProjectId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.id).toBe(createdProjectId);
                expect(res.body.name).toBe(testProject.name);
            });
    });

    it('/projects/:id (PUT) - Update Project', () => {
        return request(app.getHttpServer())
            .put(`/api/v1/projects/${createdProjectId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Updated Website Redesign' })
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toBe('Updated Website Redesign');
            });
    });

    it('/projects/:id/status (PATCH) - Update Project Status', () => {
        return request(app.getHttpServer())
            .patch(`/api/v1/projects/${createdProjectId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'IN_PROGRESS' })
            .expect(200)
            .expect((res) => {
                expect(res.body.status).toBe('IN_PROGRESS');
            });
    });

    it('/projects/:id/members (POST) - Add Member to Project', () => {
        // Will use the admin's UUID to add him as member for simplicity
        return request(app.getHttpServer())
            .post(`/api/v1/projects/${createdProjectId}/members`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                userId: env.seeder['seedUserId'], // Directly grabbing from seeder
                role: 'PROJECT_MANAGER'
            })
            .expect(201);
    });

    it('/projects/:id/members (GET) - List Project Members', () => {
        return request(app.getHttpServer())
            .get(`/api/v1/projects/${createdProjectId}/members`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .expect((res) => {
                expect(Array.isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThanOrEqual(1);
            });
    });

    it('/projects/:id/members/:userId (DELETE) - Remove Member from Project', () => {
        return request(app.getHttpServer())
            .delete(`/api/v1/projects/${createdProjectId}/members/${env.seeder['seedUserId']}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.message).toBe('Member removed successfully');
            });
    });
});
