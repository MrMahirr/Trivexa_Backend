import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2eEnvironment } from './helpers/e2e-environment';

describe('Corporate Core: Roles & Departments (E2E)', () => {
  let env: E2eEnvironment;
  let app: INestApplication;
  let adminToken: string;

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

  describe('Departments', () => {
    it('/departments (GET) - List Departments', () => {
      return request(app.getHttpServer())
        .get('/api/v1/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1); // At least one department from seed
        });
    });

    it('/departments/:id (GET) - Get Department Detail', async () => {
      // Get first department id
      const deptsRes = await request(app.getHttpServer())
        .get('/api/v1/departments')
        .set('Authorization', `Bearer ${adminToken}`);
      const deptId = deptsRes.body[0].id;

      return request(app.getHttpServer())
        .get(`/api/v1/departments/${deptId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(deptId);
          expect(res.body.name).toBeDefined();
        });
    });

    it('/departments/:id (GET) - Get Non-Existent Department (404)', async () => {
      return request(app.getHttpServer())
        .get(`/api/v1/departments/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('Roles & Permissions', () => {
    it('/roles (GET) - List Roles', () => {
      return request(app.getHttpServer())
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1); // At least ADMIN role should exist
        });
    });

    it('/roles/:id (GET) - Get Role Detail', async () => {
      // Get first role id
      const rolesRes = await request(app.getHttpServer())
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${adminToken}`);
      const roleId = rolesRes.body[0].id;

      return request(app.getHttpServer())
        .get(`/api/v1/roles/${roleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(roleId);
          expect(res.body.name).toBeDefined();
        });
    });

    it('/permissions (GET) - List Permissions', () => {
      return request(app.getHttpServer())
        .get('/api/v1/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
