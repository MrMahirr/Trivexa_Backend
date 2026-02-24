import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2eEnvironment } from './helpers/e2e-environment';

describe('Operations: Client Portal (E2E)', () => {
  let env: E2eEnvironment;
  let app: INestApplication;
  let clientToken: string;

  beforeAll(async () => {
    env = new E2eEnvironment();
    await env.setup();
    app = env.app;

    // Seed a standard user
    await env.seeder.seedUser();

    // Let's create a Client User (or just another user with CLIENT role for testing)
    // We'll use the existing seeder user login but realistically should be a CLIENT role.
    // For this test, we just need to hit the login and dashboard.
  }, 60000);

  afterAll(async () => {
    await env.teardown();
  });

  it('/portal/login (POST) - Login to Client Portal', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/portal/login')
      .send({
        email: 'seed@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    clientToken = res.body.accessToken;
  });

  it('/portal/dashboard (GET) - Get Dashboard Data', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/portal/dashboard')
      .set('Authorization', `Bearer ${clientToken}`);

    if (res.status !== 200) {
      console.log('Dashboard Error:', res.body, 'Token:', clientToken);
    }

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Welcome to Client Portal');
    expect(res.body.clientId).toBeDefined();
  });
});
