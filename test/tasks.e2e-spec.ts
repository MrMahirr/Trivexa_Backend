import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2eEnvironment } from './helpers/e2e-environment';

describe('Operations: Tasks (E2E)', () => {
    let env: E2eEnvironment;
    let app: INestApplication;
    let adminToken: string;
    let createdClientId: string;
    let createdProjectId: string;
    let createdUserId: string;
    let createdTaskId: string;

    beforeAll(async () => {
        env = new E2eEnvironment();
        await env.setup();
        app = env.app;

        await env.seeder.seedUser();

        // 1. Login as admin
        const adminRes = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
                email: 'seed@example.com',
                password: 'Password123!',
            });
        adminToken = adminRes.body.accessToken;

        // 2. Create a Client
        const clientRes = await request(app.getHttpServer())
            .post('/api/v1/clients')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                companyName: 'Task Test Client',
                contactPerson: 'Task Contact',
                email: 'task_test@example.com',
                phone: '+1234567890',
            });
        createdClientId = clientRes.body.id;

        // 3. Create a Project
        const projectRes = await request(app.getHttpServer())
            .post('/api/v1/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Task Management Project',
                description: 'Project for testing tasks',
                clientId: createdClientId,
                budget: 10000,
            });
        createdProjectId = projectRes.body.id;

        // 4. Create an Assignee User
        const userRes = await request(app.getHttpServer())
            .post('/api/v1/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: 'task_assignee@example.com',
                password: 'Password123!',
                firstName: 'Task',
                lastName: 'Assignee',
                role: 'MEMBER'
            });
        createdUserId = userRes.body.id;

        // 5. Add user to project
        await request(app.getHttpServer())
            .post(`/api/v1/projects/${createdProjectId}/members`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                userId: createdUserId,
                role: 'MEMBER'
            });

    }, 60000);

    afterAll(async () => {
        await env.teardown();
    });

    const testTask = {
        title: 'Implement E2E Tests',
        description: 'Write end-to-end tests for all modules',
        priority: 'HIGH',
        dueDate: '2026-03-01T00:00:00.000Z'
    };

    it('/tasks/projects/:projectId/tasks (POST) - Create Task', async () => {
        const res = await request(app.getHttpServer())
            .post(`/api/v1/tasks/projects/${createdProjectId}/tasks`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                ...testTask,
                assigneeId: createdUserId
            });

        if (res.status !== 201) {
            console.log('Create Task Error:', res.body);
        }

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        expect(res.body.title).toBe(testTask.title);
        expect(res.body.projectId).toBe(createdProjectId);
        createdTaskId = res.body.id;
    });

    it('/tasks/projects/:projectId/tasks (GET) - List Tasks by Project', async () => {
        const res = await request(app.getHttpServer())
            .get(`/api/v1/tasks/projects/${createdProjectId}/tasks`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toBeDefined();
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.some((t: any) => t.id === createdTaskId)).toBe(true);
    });

    it('/tasks/:id (GET) - Get Task Detail', async () => {
        const res = await request(app.getHttpServer())
            .get(`/api/v1/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(createdTaskId);
        expect(res.body.title).toBe(testTask.title);
    });

    it('/tasks/:id (PUT) - Update Task', async () => {
        const res = await request(app.getHttpServer())
            .put(`/api/v1/tasks/${createdTaskId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ title: 'Implement E2E Tests - Updated' });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Implement E2E Tests - Updated');
    });

    it('/tasks/:id/status (PATCH) - Update Task Status', async () => {
        const res = await request(app.getHttpServer())
            .patch(`/api/v1/tasks/${createdTaskId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'IN_PROGRESS' });

        if (res.status !== 200) {
            console.log('Task Status Update Error:', res.body);
        }

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('IN_PROGRESS');
    });
});
