import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestContainer } from '../src/test/test-container';
import { DatabasePool } from '../src/database/pool';

describe('Auth System (E2E)', () => {
  let app: INestApplication;
  let testContainer: TestContainer;

  beforeAll(async () => {
    // Start Docker container
    testContainer = new TestContainer();
    await testContainer.start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabasePool)
      .useValue({
        getPool: () => testContainer.getPool(),
        onModuleInit: async () => {},
        onModuleDestroy: async () => {},
      })
      .compile();

    app = moduleFixture.createNestApplication();
    // Mimic main.ts configuration
    app.setGlobalPrefix('api/v1');
    await app.init();
  }, 60000); // Increase timeout for Docker start

  afterAll(async () => {
    await app.close();
    await testContainer.stop();
  });

  let accessToken: string;
  const testUser = {
    email: 'e2e@example.com',
    password: 'Password123!',
    firstName: 'E2E',
    lastName: 'User',
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

  it('/auth/me (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(testUser.email);
        expect(res.body.role).toBeDefined();
      });
  });
});
