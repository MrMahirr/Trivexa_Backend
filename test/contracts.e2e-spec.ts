import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2eEnvironment } from './helpers/e2e-environment';

describe('Operations: Contracts (E2E)', () => {
  let env: E2eEnvironment;
  let app: INestApplication;
  let adminToken: string;
  let createdClientId: string;
  let createdContractId: string;

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

    // Create a Client to use for Contract
    const clientRes = await request(app.getHttpServer())
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        companyName: 'Contracts Test Client',
        contactPerson: 'Contract Contact',
        email: 'contract_test@example.com',
        phone: '+1234567890',
      });
    createdClientId = clientRes.body.id;
  }, 60000);

  afterAll(async () => {
    await env.teardown();
  });

  it('/contracts (POST) - Create Contract', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/contracts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        clientId: createdClientId,
        title: 'SEO Services Contract',
        description: 'Monthly SEO services',
        startDate: '2026-03-01',
        endDate: '2026-12-31',
        value: 12000.0,
      });

    if (res.status !== 201) {
      console.log('Contract Create Error:', res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    createdContractId = res.body.id;
  });

  it('/contracts (GET) - Get All Contracts', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/contracts')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('/contracts/:id (GET) - Get Contract by ID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/contracts/${createdContractId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdContractId);
  });

  it('/contracts/:id/approve (PATCH) - Approve Contract', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/contracts/${createdContractId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    if (res.status !== 200) {
      console.log('Contract Approve Error:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('APPROVED');
  });

  it('/contracts/:id/sign (PATCH) - Sign Contract', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/contracts/${createdContractId}/sign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        signedUrl: 'https://example.com/signed-contract.pdf',
      });

    if (res.status !== 200) {
      console.log('Contract Sign Error:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('SIGNED');
    expect(res.body.signedUrl).toBe('https://example.com/signed-contract.pdf');
  });
});
