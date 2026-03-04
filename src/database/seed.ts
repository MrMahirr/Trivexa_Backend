import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('🌱 Yüksek Ölçekli Trivexa Veritabanı Seed İşlemi Başlıyor...');
    // await client.query('BEGIN');

    // Miktarlar (Ölçek)
    const USER_COUNT = 30;
    const CLIENT_COUNT = 40;
    const PROJECT_COUNT = 60;
    const TASK_PER_PROJECT = 5;
    const INVOICE_PER_CLIENT = 3;
    const EXPENSE_COUNT = 80;
    const TICKET_COUNT = 50;

    console.log('Kullanıcı şifreleri şifreleniyor...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const roles = ['ADMIN', 'CEO', 'MANAGER', 'HR', 'ACCOUNT_MANAGER', 'ACCOUNTING', 'DEVELOPER', 'SOCIAL_MEDIA', 'CREATIVE', 'MARKETING', 'PRODUCTION'];
    const userIds: string[] = [];

    // 1. Sabit Yöneticiler
    const fixedUsers = [
      {
        email: 'admin@trivexa.com',
        role: 'ADMIN',
        first: 'Trivexa',
        last: 'Boss',
      },
      {
        email: 'manager@trivexa.com',
        role: 'MANAGER',
        first: 'Manager',
        last: 'Accountant',
      },
      {
        email: 'dev@trivexa.com',
        role: 'DEVELOPER',
        first: 'Lead',
        last: 'Developer',
      },
    ];

    for (const u of fixedUsers) {
      const res = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role RETURNING id;`,
        [u.email, passwordHash, u.first, u.last, u.role, true],
      );
      if (res.rows[0]) userIds.push(res.rows[0].id);
    }

    // 1.1 Rastgele Kullanıcılar (Faker)
    console.log(
      `👤 ${USER_COUNT} adet rastgele çalışan profili oluşturuluyor...`,
    );
    for (let i = 0; i < USER_COUNT; i++) {
      const email = faker.internet.email();
      try {
        const res = await client.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (email) DO NOTHING RETURNING id;`,
          [
            email,
            passwordHash,
            faker.person.firstName(),
            faker.person.lastName(),
            faker.helpers.arrayElement(roles),
            true,
          ],
        );
        if (res.rows[0]) userIds.push(res.rows[0].id);
      } catch (e: any) {
        console.error('User Error:', e.message);
      }
    }

    // 2. Firmalar / Müşteriler (Clients)
    console.log(`🏢 ${CLIENT_COUNT} adet kurumsal müşteri oluşturuluyor...`);
    const clientIds: string[] = [];
    for (let i = 0; i < CLIENT_COUNT; i++) {
      const email = faker.internet.email();
      try {
        const res = await client.query(
          `INSERT INTO clients (company_name, contact_person, email, phone, address)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (email) DO NOTHING RETURNING id;`,
          [
            faker.company.name(),
            faker.person.fullName(),
            email,
            faker.phone.number(),
            faker.location.streetAddress({ useFullAddress: true }),
          ],
        );
        if (res.rows[0]) clientIds.push(res.rows[0].id);
      } catch (e: any) {
        console.error('Client Error:', e.message);
      }
    }

    // 3. Projeler ve Proje Üyeleri (Projects)
    console.log(`📁 ${PROJECT_COUNT} adet proje derleniyor...`);
    const projectStatuses = [
      'DRAFT',
      'PLANNING',
      'IN_PROGRESS',
      'ON_HOLD',
      'COMPLETED',
      'CANCELLED',
    ];
    const projectIds: string[] = [];

    for (let i = 0; i < PROJECT_COUNT; i++) {
      const ownerId = faker.helpers.arrayElement(userIds);
      const clientId = faker.helpers.arrayElement(clientIds);
      const status = faker.helpers.arrayElement(projectStatuses);

      const startDate = faker.date.past({ years: 1 });
      const deadline = new Date(
        startDate.getTime() +
          faker.number.int({ min: 10, max: 300 }) * 24 * 60 * 60 * 1000,
      );

      try {
        const res = await client.query(
          `INSERT INTO projects (name, client_id, status, budget, created_by, start_date, deadline, description)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;`,
          [
            faker.commerce.productName() + ' Projesi',
            clientId,
            status,
            faker.number.int({ min: 5000, max: 1000000 }),
            ownerId,
            startDate,
            deadline,
            faker.lorem.paragraph(),
          ],
        );

        const projectId = res.rows[0].id;
        projectIds.push(projectId);

        const memberCount = faker.number.int({ min: 1, max: 4 });
        for (let m = 0; m < memberCount; m++) {
          const teamMember = faker.helpers.arrayElement(userIds);
          await client.query(
            `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;`,
            [projectId, teamMember, m === 0 ? 'PROJECT_LEAD' : 'MEMBER'],
          );
        }
      } catch (e: any) {
        console.error('Project Error:', e.message);
      }
    }

    // 4. Görevler (Tasks)
    console.log(
      `📝 Her proje için ortalama ${TASK_PER_PROJECT} görev atanıyor...`,
    );
    const taskStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

    for (const projectId of projectIds) {
      const taskCount = faker.number.int({ min: 1, max: TASK_PER_PROJECT * 2 });

      for (let t = 0; t < taskCount; t++) {
        try {
          await client.query(
            `INSERT INTO tasks (title, project_id, status, priority, assignee_id, created_by, due_date, description)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              faker.hacker.verb() + ' ' + faker.hacker.noun(),
              projectId,
              faker.helpers.arrayElement(taskStatuses),
              faker.helpers.arrayElement(priorities),
              faker.helpers.arrayElement(userIds), // Atanan
              faker.helpers.arrayElement(userIds), // Oluşturan
              faker.date.soon({ days: 60 }),
              faker.lorem.sentences(2),
            ],
          );
        } catch (e: any) {
          console.error('Task Error:', e.message);
        }
      }
    }

    // 5. Faturalandırma ve Ödemeler (Invoices & Payments & Items)
    console.log(`💲 Finansal hareketlilik (Fatura/Ödeme) yaratılıyor...`);
    const invoiceStatuses = [
      'DRAFT',
      'ISSUED',
      'PAID',
      'OVERDUE',
      'PARTIALLY_PAID',
      'CANCELLED',
    ];
    const paymentMethods = [
      'BANK_TRANSFER',
      'CREDIT_CARD',
      'CASH',
      'CRYPTO',
      'OTHER',
    ];

    for (const clientId of clientIds) {
      const billCount = faker.number.int({ min: 1, max: INVOICE_PER_CLIENT });

      for (let b = 0; b < billCount; b++) {
        const amount = faker.number.int({ min: 500, max: 50000 });
        const taxRate = faker.helpers.arrayElement([0, 10, 18, 20]);
        const taxAmount = amount * (taxRate / 100);
        const total = amount + taxAmount;

        const status = faker.helpers.arrayElement(invoiceStatuses);
        let paidAmount = 0;

        if (status === 'PAID') paidAmount = total;
        if (status === 'PARTIALLY_PAID') paidAmount = total / 2;

        const issueDate = faker.date.past({ years: 1 });
        const dueDate = new Date(
          issueDate.getTime() +
            faker.number.int({ min: 15, max: 45 }) * 24 * 60 * 60 * 1000,
        );

        try {
          const invRes = await client.query(
            `INSERT INTO invoices (
                invoice_number, client_id, project_id, status, subtotal, tax_rate, tax_amount, total, 
                issue_date, due_date, notes, created_by
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id;`,
            [
              'INV-' + faker.string.alphanumeric(6).toUpperCase(),
              clientId,
              faker.helpers.arrayElement([
                null,
                faker.helpers.arrayElement(projectIds),
              ]), // %50 ihtimalle projeye bağlı
              status,
              amount,
              taxRate,
              taxAmount,
              total,
              issueDate,
              dueDate,
              faker.finance.transactionDescription(),
              faker.helpers.arrayElement(userIds),
            ],
          );

          const invoiceId = invRes.rows[0].id;

          // Fatura Kalemleri (Items)
          const itemCount = faker.number.int({ min: 1, max: 5 });
          for (let ic = 0; ic < itemCount; ic++) {
            const unitPrice = faker.number.int({ min: 50, max: 5000 });
            const quantity = faker.number.int({ min: 1, max: 10 });
            await client.query(
              `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total)
                     VALUES ($1, $2, $3, $4, $5)`,
              [
                invoiceId,
                faker.commerce.productName() + ' Hizmeti',
                quantity,
                unitPrice,
                quantity * unitPrice,
              ],
            );
          }

          // Fatura Ödemeleri (Payments)
          if (paidAmount > 0) {
            await client.query(
              `INSERT INTO payments (invoice_id, amount, method)
                     VALUES ($1, $2, $3)`,
              [
                invoiceId,
                paidAmount,
                faker.helpers.arrayElement(paymentMethods),
              ],
            );
          }
        } catch (e: any) {
          console.error('Invoice/Payment Error:', e.message);
        }
      }
    }

    // 6. Şirket Harcamaları (Expenses)
    console.log(
      `💸 ${EXPENSE_COUNT} adet ofis / proje harcaması (Expense) giriliyor...`,
    );
    const expenseCategories = [
      'OFFICE',
      'TRAVEL',
      'SOFTWARE',
      'HARDWARE',
      'MARKETING',
      'MEALS',
      'OTHER',
    ];
    for (let i = 0; i < EXPENSE_COUNT; i++) {
      try {
        await client.query(
          `INSERT INTO expenses (description, amount, expense_date, category, status, department, requested_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            faker.company.catchPhrase(),
            faker.number.float({ min: 15, max: 3000, fractionDigits: 2 }),
            faker.date.past({ years: 1 }),
            faker.helpers.arrayElement(expenseCategories),
            faker.helpers.arrayElement([
              'PENDING',
              'APPROVED',
              'REJECTED',
              'PAID',
            ]),
            faker.commerce.department(),
            faker.helpers.arrayElement(userIds), // Requested by
          ],
        );
      } catch (e: any) {
        console.error('Expense Error:', e.message);
      }
    }

    // 7. Destek Biletleri (Tickets)
    console.log(
      `🎫 ${TICKET_COUNT} adet sistem destek bileti (Ticket) uyduruluyor...`,
    );
    const ticketStatuses = [
      'OPEN',
      'IN_PROGRESS',
      'WAITING_ON_CLIENT',
      'RESOLVED',
      'CLOSED',
    ];
    const ticketTypes = ['BUG', 'FEATURE_REQUEST', 'SUPPORT', 'BILLING'];

    for (let i = 0; i < TICKET_COUNT; i++) {
      try {
        await client.query(
          `INSERT INTO tickets (project_id, subject, description, type, status, priority, created_by, assigned_to)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            faker.helpers.arrayElement([
              null,
              faker.helpers.arrayElement(projectIds),
            ]),
            faker.hacker.phrase(),
            faker.lorem.paragraphs(2),
            faker.helpers.arrayElement(ticketTypes),
            faker.helpers.arrayElement(ticketStatuses),
            faker.helpers.arrayElement(priorities),
            faker.helpers.arrayElement(userIds), // Bileti açan
            faker.helpers.arrayElement([
              null,
              faker.helpers.arrayElement(userIds),
            ]), // Görevli
          ],
        );
      } catch (e: any) {
        console.error('Ticket Error:', e.message);
      }
    }

    // await client.query('COMMIT');
    console.log(
      '✅ Yüksek Ölçekli Seed işlemi TAMAMLANDI! Trivexa Veritabanı devasa verilerle dolduruldu. 🚀',
    );
  } catch (e) {
    // await client.query('ROLLBACK');
    console.error('❌ Seeding işlemi başarısız oldu (HATA):', e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
