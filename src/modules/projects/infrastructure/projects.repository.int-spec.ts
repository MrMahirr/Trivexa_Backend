import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsRepository } from './projects.repository';
import { DatabasePool } from '../../../database/pool';
import { CacheService } from '../../../infrastructure/cache/cache.service';
import { TestContainer } from '../../../test/test-container';

describe('ProjectsRepository (Integration)', () => {
    let repository: ProjectsRepository;
    let testContainer: TestContainer;
    let cacheService: Partial<CacheService>;

    beforeAll(async () => {
        jest.setTimeout(60000); // Container startup might take time
        testContainer = new TestContainer();
        await testContainer.start();
    });

    afterAll(async () => {
        await testContainer.stop();
    });

    beforeEach(async () => {
        // Clear tables or reset state if needed
        const pool = testContainer.getPool();
        await pool.query('TRUNCATE TABLE projects, clients, users CASCADE');

        cacheService = {
            getOrSet: jest.fn().mockImplementation((key, fn) => fn()),
            del: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectsRepository,
                {
                    provide: DatabasePool,
                    useValue: {
                        getPool: () => testContainer.getPool(),
                    },
                },
                { provide: CacheService, useValue: cacheService },
            ],
        }).compile();

        repository = module.get<ProjectsRepository>(ProjectsRepository);
    });

    it('should create and retrieve a project', async () => {
        const pool = testContainer.getPool();

        // Setup dependencies (User, Client)
        const userRes = await pool.query(`
            INSERT INTO users (email, password_hash, first_name, last_name) 
            VALUES ('test@example.com', 'hash', 'Test', 'User') RETURNING id
        `);
        const userId = userRes.rows[0].id;

        const clientRes = await pool.query(`
            INSERT INTO clients (company_name, contact_person, email) 
            VALUES ('Test Corp', 'Contact', 'client@example.com') RETURNING id
        `);
        const clientId = clientRes.rows[0].id;

        // Test create
        const project = await repository.create({
            name: 'Integration Project',
            description: 'Test Description',
            clientId: clientId,
            createdBy: userId,
            budget: 1000
        });

        expect(project).toBeDefined();
        expect(project.id).toBeDefined();
        expect(project.name).toBe('Integration Project');

        // Test findById
        const found = await repository.findById(project.id);
        expect(found).toBeDefined();
        expect(found?.id).toBe(project.id);
        expect(found?.name).toBe('Integration Project');
    });
});
