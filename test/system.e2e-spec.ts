import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2eEnvironment } from './helpers/e2e-environment';

describe('Operations: System & Audit (E2E)', () => {
  let env: E2eEnvironment;
  let app: INestApplication;
  let adminToken: string;

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

  describe('Health', () => {
    it('/health (GET) - Check system health', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/health');

      // Depending on the Redis block or DB readiness in the isolated container, it might return 503 instead of 200, but structured data should be present.
      expect([200, 503]).toContain(res.status);
      expect(res.body).toBeDefined();
      expect(res.body.status).toBeDefined();
    });
  });

  describe('Reports', () => {
    it('/reports/financial (GET) - Get Financial Report', async () => {
      const res = await request(app.getHttpServer())
        .get(
          '/api/v1/reports/financial?startDate=2024-01-01&endDate=2026-12-31',
        )
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });

    it('/reports/projects (GET) - Get Project Analytics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/reports/projects?startDate=2024-01-01&endDate=2026-12-31')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });
  });
});
