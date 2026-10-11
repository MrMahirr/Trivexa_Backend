import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { E2eEnvironment } from './helpers/e2e-environment';

describe('Operations: Finance (E2E)', () => {
  let env: E2eEnvironment;
  let app: INestApplication;
  let adminToken: string;
  let createdExpenseId: string;
  let createdClientId: string;
  let createdInvoiceId: string;
  let createdPaymentId: string;
  let createdPaymentToDeleteId: string;
  let accountingToken: string;
  let socialMediaToken: string;

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

    // Create a Client to use for Invoice
    const clientRes = await request(app.getHttpServer())
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        companyName: 'Finance Test Client',
        contactPerson: 'Finance Contact',
        email: 'finance_test@example.com',
        phone: '+1234567890',
      });
    createdClientId = clientRes.body.id;

    // Create accounting user
    await request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'accounting_finance_e2e@example.com',
        password: 'Password123!',
        firstName: 'Accounting',
        lastName: 'E2E',
        role: 'ACCOUNTING',
        department: 'FINANCE',
      });

    const accountingLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'accounting_finance_e2e@example.com',
        password: 'Password123!',
      });
    accountingToken = accountingLoginRes.body.accessToken;

    // Create social media (SEO equivalent) user
    await request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'seo_finance_e2e@example.com',
        password: 'Password123!',
        firstName: 'Seo',
        lastName: 'E2E',
        role: 'SOCIAL_MEDIA',
        department: 'MARKETING',
      });

    const socialMediaLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'seo_finance_e2e@example.com',
        password: 'Password123!',
      });
    socialMediaToken = socialMediaLoginRes.body.accessToken;
  }, 60000);

  afterAll(async () => {
    await env.teardown();
  });

  // ----------------------------------------
  // EXPENSES
  // ----------------------------------------
  it('/expenses (POST) - Create Expense', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/expenses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        description: 'Office supplies for testing',
        amount: 150.5,
        category: 'OFFICE',
        department: 'HR Department',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    createdExpenseId = res.body.id;
  });

  it('/expenses (GET) - Get All Expenses', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/expenses')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/expenses/:id/approve (PATCH) - Approve Expense', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/expenses/${createdExpenseId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('APPROVED');
  });

  // ----------------------------------------
  // INVOICES
  // ----------------------------------------
  it('/invoices (POST) - Create Invoice', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        clientId: createdClientId,
        taxRate: 20,
        issueDate: '2026-02-24',
        dueDate: '2026-03-24',
        notes: 'Test invoice notes',
        items: [
          {
            description: 'Web Development Services',
            quantity: 1,
            unitPrice: 1500.0,
          },
        ],
      });

    if (res.status !== 201) {
      console.log('Invoice Create Error:', res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    createdInvoiceId = res.body.id;
  });

  it('/invoices (GET) - Get All Invoices', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/invoices')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/invoices/:id/status (PATCH) - Update Invoice Status', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/invoices/${createdInvoiceId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'SENT' }); // Valid status should be SENT. Will check if it causes 400.

    if (res.status !== 200) {
      console.log('Invoice Status Update Error:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('SENT');
  });

  // ----------------------------------------
  // PAYMENTS
  // ----------------------------------------
  it('/payments (POST) - Create Payment', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        invoiceId: createdInvoiceId,
        amount: 1500.0,
        method: 'BANK_TRANSFER',
        paymentDate: '2026-02-24',
        reference: 'REF-TEST-001',
        notes: 'Payment for invoice',
      });

    if (res.status !== 201) {
      console.log('Payment Create Error:', res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    createdPaymentId = res.body.id;
  });

  it('/payments (POST) - Create Payment to Delete', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        invoiceId: createdInvoiceId,
        amount: 300.0,
        method: 'BANK_TRANSFER',
        paymentDate: '2026-02-24',
        reference: 'REF-TEST-DELETE',
        notes: 'Payment to delete',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    createdPaymentToDeleteId = res.body.id;
  });

  it('/payments/invoice/:invoiceId (GET) - Get Payments by Invoice ID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/payments/invoice/${createdInvoiceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('/payments/:id/refund (POST) - Accounting can refund', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/payments/${createdPaymentId}/refund`)
      .set('Authorization', `Bearer ${accountingToken}`)
      .send({
        amount: 100,
        reason: 'E2E refund',
      });

    expect(res.status).toBe(201);
    expect(Number(res.body.amount)).toBeLessThan(0);
  });

  it('/payments/:id (DELETE) - Social media (SEO) can delete', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/v1/payments/${createdPaymentToDeleteId}`)
      .set('Authorization', `Bearer ${socialMediaToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('/payments/invoice/:invoiceId/audit (GET) - audit pagination works', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/api/v1/payments/invoice/${createdInvoiceId}/audit?page=1&limit=5&sortDirection=DESC`,
      )
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(res.body.page).toBe(1);
  });

  it('/notifications (GET) - payment events produce notifications', async () => {
    await new Promise((resolve) => setTimeout(resolve, 350));

    const res = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const rows = Array.isArray(res.body?.data) ? res.body.data : [];
    expect(
      rows.some(
        (item: any) =>
          item?.type === 'PAYMENT_REFUND_CREATED' ||
          item?.type === 'PAYMENT_DELETED',
      ),
    ).toBe(true);
  });
});
