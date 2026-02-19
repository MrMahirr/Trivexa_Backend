import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestContainer } from '../src/test/test-container';
import { DatabasePool } from '../src/database/pool';
import { assert } from 'console';

async function run() {
    console.log('Starting Manual E2E Test (Auth)...');

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
            onModuleInit: async () => { },
            onModuleDestroy: async () => { },
        })
        .compile();

    const app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    console.log('App initialized.');

    const server = app.getHttpServer();
    const testUser = {
        email: `e2e_${Date.now()}@example.com`,
        password: 'Password123!',
        firstName: 'E2E',
        lastName: 'User',
    };

    try {
        // Test Register
        console.log('Testing /auth/register...');
        const regRes = await request(server)
            .post('/api/v1/auth/register')
            .send(testUser);

        if (regRes.status !== 201) {
            console.error('Register failed with status:', regRes.status);
            console.error('Response body:', JSON.stringify(regRes.body, null, 2));
            throw new Error(`Register failed with status ${regRes.status}`);
        }

        if (!regRes.body.id) throw new Error('Registration failed: No ID returned');
        console.log('✅ /auth/register Passed');

        // Test Login
        console.log('Testing /auth/login...');
        const loginRes = await request(server)
            .post('/api/v1/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        if (loginRes.status !== 200) {
            console.error('Login failed with status:', loginRes.status);
            console.error('Response body:', JSON.stringify(loginRes.body, null, 2));
            throw new Error(`Login failed with status ${loginRes.status}`);
        }

        const accessToken = loginRes.body.accessToken;
        if (!accessToken) throw new Error('Login failed: No accessToken returned');
        console.log('✅ /auth/login Passed');

        // Test Me
        console.log('Testing /users/me...');
        const meRes = await request(server)
            .get('/api/v1/users/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        if (meRes.body.email !== testUser.email) throw new Error('Me failed: Email mismatch');
        console.log('✅ /auth/me Passed');

        console.log('🎉 All Auth Tests Passed!');

    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    } finally {
        await app.close();
        await testContainer.stop();
        console.log('Test cleanup done.');
    }
}

run();
