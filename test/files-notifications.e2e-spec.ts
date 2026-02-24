import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2eEnvironment } from './helpers/e2e-environment';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

describe('Operations: Files & Notifications (E2E)', () => {
    let env: E2eEnvironment;
    let app: INestApplication;
    let adminToken: string;
    let createdFileId: string;

    const dummyFilePath = path.join(os.tmpdir(), 'e2e-test-file.txt');

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

        if (!fs.existsSync(dummyFilePath)) {
            fs.writeFileSync(dummyFilePath, 'Hello E2E testing!', 'utf-8');
        }
    }, 60000);

    afterAll(async () => {
        if (fs.existsSync(dummyFilePath)) {
            fs.unlinkSync(dummyFilePath);
        }
        await env.teardown();
    });

    describe('Files Modülü', () => {
        it('/files/upload (POST) - Upload a file', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/v1/files/upload')
                .set('Authorization', `Bearer ${adminToken}`)
                .field('entityType', 'PROJECT')
                .field('entityId', '28b06fac-8302-4fc8-abc2-b13c34a2e873') // UUID format
                .field('folderPath', '/uploads/test')
                .field('isPublic', 'true')
                .attach('file', dummyFilePath);

            if (res.status !== 201) {
                console.log('File Upload Error:', res.body);
            }

            expect(res.status).toBe(201);
            expect(res.body.id).toBeDefined();
            createdFileId = res.body.id;
        });

        it('/files/:id (GET) - Get file metadata', async () => {
            const res = await request(app.getHttpServer())
                .get(`/api/v1/files/${createdFileId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(createdFileId);
            expect(res.body.fileName).toBe('e2e-test-file.txt');
        });

        it('/files/:id/download (GET) - Download file', async () => {
            const res = await request(app.getHttpServer())
                .get(`/api/v1/files/${createdFileId}/download`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect([200, 302]).toContain(res.status); // Can be a redirect to S3 or direct stream (200)
        });
    });

    describe('Notifications Modülü', () => {
        it('/notifications/email (POST) - Queue an email', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/v1/notifications/email')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    to: 'test@example.com',
                    subject: 'E2E Test Email',
                    content: 'This is a test email content',
                    isHtml: false,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('/notifications (GET) - Get current user notifications', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/v1/notifications')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            const data = res.body.data || res.body;
            expect(Array.isArray(data)).toBe(true);
        });

        it('/notifications/unread-count (GET) - Get unread count', async () => {
            const res = await request(app.getHttpServer())
                .get('/api/v1/notifications/unread-count')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toBeDefined();
        });

        it('/notifications/read-all (PATCH) - Mark all as read', async () => {
            const res = await request(app.getHttpServer())
                .patch('/api/v1/notifications/read-all')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
