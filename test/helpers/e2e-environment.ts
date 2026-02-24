import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { TestContainer } from '../../src/test/test-container';
import { DatabasePool } from '../../src/database/pool';
import { E2eSeeder } from './e2e-seeder';


export class E2eEnvironment {
    public app: INestApplication;
    public testContainer: TestContainer;
    public seeder: E2eSeeder;

    async setup(): Promise<void> {
        this.testContainer = new TestContainer();
        await this.testContainer.start();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(DatabasePool)
            .useValue({
                getPool: () => this.testContainer.getPool(),
                onModuleInit: async () => { },
                onModuleDestroy: async () => { },
            })
            .compile();

        this.app = moduleFixture.createNestApplication();

        // Mimic main.ts configurations
        this.app.setGlobalPrefix('api/v1');
        this.app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

        await this.app.init();

        this.seeder = new E2eSeeder(this.testContainer.getPool());
    }

    async teardown(): Promise<void> {
        if (this.app) {
            await this.app.close();
        }
        if (this.testContainer) {
            await this.testContainer.stop();
        }
    }

    getHttpServer() {
        return this.app.getHttpServer();
    }
}
