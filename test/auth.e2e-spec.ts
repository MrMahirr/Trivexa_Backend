import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2eEnvironment } from './helpers/e2e-environment';

describe('Auth System (E2E)', () => {
  let env: E2eEnvironment;
  let app: INestApplication;

  beforeAll(async () => {
    env = new E2eEnvironment();
    await env.setup();
    app = env.app;
  }, 60000); // Increase timeout for Docker start

  afterAll(async () => {
    await env.teardown();
  });

  let accessToken: string;
  const testUser = {
    email: 'e2e@example.com',
    password: 'Password123!',
    firstName: 'E2E',
    lastName: 'User',
    role: 'MEMBER',
  };

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.email).toBe(testUser.email);
      });
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
        accessToken = res.body.accessToken;
      });
  });

  it('/users/me (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(testUser.email);
        expect(res.body.role).toBeDefined();
      });
  });
});
