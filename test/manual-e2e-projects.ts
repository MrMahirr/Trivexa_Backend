import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestContainer } from '../src/test/test-container';
import { DatabasePool } from '../src/database/pool';

async function run() {
  console.log('Starting Manual E2E Test (Projects)...');

  // 1. Start Docker
  const testContainer = new TestContainer();
  await testContainer.start();

  // 2. Bootstrap App
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

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  await app.init();

  console.log('App initialized.');

  const server = app.getHttpServer();
  const adminUser = {
    email: `admin_${Date.now()}@example.com`,
    password: 'Password123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN', // Verify this is allowed in DTO
  };

  try {
    // 1. Register Admin
    console.log('Registering Admin...');
    const regRes = await request(server)
      .post('/api/v1/auth/register')
      .send(adminUser);

    if (regRes.status !== 201) {
      console.error(
        'Register failed:',
        regRes.status,
        JSON.stringify(regRes.body),
      );
      throw new Error(`Register failed with status ${regRes.status}`);
    }
    console.log('✅ Admin Registered');

    // 2. Login
    console.log('Logging in...');
    const loginRes = await request(server).post('/api/v1/auth/login').send({
      email: adminUser.email,
      password: adminUser.password,
    });

    if (loginRes.status !== 200) {
      console.error('Login failed:', loginRes.status);
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    const accessToken = loginRes.body.accessToken;
    console.log('✅ Logged in');

    // 3. Create Project
    const newProject = {
      name: 'E2E Project',
      description: 'Test Description',
      startDate: new Date().toISOString(),
      status: 'PLANNING',
    };

    console.log('Creating Project...');
    const createRes = await request(server)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(newProject);

    if (createRes.status !== 201) {
      console.error(
        'Create Project failed:',
        createRes.status,
        JSON.stringify(createRes.body),
      );
      throw new Error(`Create Project failed with status ${createRes.status}`);
    }
    const projectId = createRes.body.id;
    if (!projectId) throw new Error('No project ID returned');
    console.log('✅ Project Created:', projectId);

    // 4. List Projects
    console.log('Listing Projects...');
    const listRes = await request(server)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${accessToken}`);

    if (listRes.status !== 200) {
      console.error('List Projects failed:', listRes.status);
      throw new Error(`List Projects failed with status ${listRes.status}`);
    }
    // Assuming pagination or array
    const projects = listRes.body.data || listRes.body;
    if (!Array.isArray(projects) || projects.length === 0) {
      // It might be a paginated response with 'data' field
      if (listRes.body.items && Array.isArray(listRes.body.items)) {
        if (listRes.body.items.length === 0)
          throw new Error('Project list empty');
      } else {
        throw new Error('Project list empty or invalid format');
      }
    }
    console.log('✅ Projects Listed');

    // 5. Get Project Details
    console.log('Getting Project Details...');
    const detailRes = await request(server)
      .get(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    if (detailRes.status !== 200) {
      console.error('Get details failed:', detailRes.status);
      throw new Error(`Get details failed with status ${detailRes.status}`);
    }
    if (detailRes.body.id !== projectId) throw new Error('Project ID mismatch');
    console.log('✅ Project Details Verified');

    console.log('🎉 All Project Tests Passed!');
  } catch (error) {
    console.error('❌ Test Failed:', error);
    process.exit(1);
  } finally {
    await app.close();
    await testContainer.stop();
    console.log('Cleanup done.');
  }
}

run();
