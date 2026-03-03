import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2eEnvironment } from './helpers/e2e-environment';
import { Role } from '../src/shared/enums';

describe('Users System (E2E)', () => {
  let env: E2eEnvironment;
  let app: INestApplication;
  let adminToken: string;
  let createdUserId: string;

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

  const testUser = {
    email: 'newuser@example.com',
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    role: Role.MEMBER,
  };

  it('/users (POST) - Create User', () => {
    return request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.email).toBe(testUser.email);
        createdUserId = res.body.id;
      });
  });

  it('/users/:id (GET) - Get User', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(createdUserId);
        expect(res.body.email).toBe(testUser.email);
      });
  });

  it('/users/:id (PUT) - Update User', () => {
    return request(app.getHttpServer())
      .put(`/api/v1/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'UpdatedTest' })
      .expect(200)
      .expect((res) => {
        expect(res.body.firstName).toBe('UpdatedTest');
      });
  });

  it('/users/:id/deactivate (PATCH) - Deactivate User', () => {
    return request(app.getHttpServer())
      .patch(`/api/v1/users/${createdUserId}/deactivate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.isActive).toBe(false);
      });
  });
});
