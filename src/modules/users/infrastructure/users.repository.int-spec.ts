import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { DatabasePool } from '../../../database/pool';
import { CacheService } from '../../../infrastructure/cache/cache.service';
import { TestContainer } from '../../../test/test-container';

describe('UsersRepository (Integration)', () => {
  let repository: UsersRepository;
  let testContainer: TestContainer;
  let cacheService: Partial<CacheService>;

  beforeAll(async () => {
    jest.setTimeout(60000);
    testContainer = new TestContainer();
    await testContainer.start();
  });

  afterAll(async () => {
    await testContainer.stop();
  });

  beforeEach(async () => {
    const pool = testContainer.getPool();
    await pool.query('TRUNCATE TABLE users CASCADE');

    cacheService = {
      getOrSet: jest.fn().mockImplementation((key, fn) => fn()),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: DatabasePool,
          useValue: {
            getPool: () => testContainer.getPool(),
          },
        },
        { provide: CacheService, useValue: cacheService },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should create and find a user', async () => {
    const user = await repository.create({
      email: 'int_test@example.com',
      passwordHash: 'secret',
      firstName: 'Int',
      lastName: 'Test',
      role: 'DEVELOPER',
    });

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBe('int_test@example.com');

    const found = await repository.findById(user.id);
    expect(found).toBeDefined();
    expect(found?.email).toBe('int_test@example.com');
  });

  it('should find by email', async () => {
    await repository.create({
      email: 'findme@example.com',
      passwordHash: 'secret',
      firstName: 'Find',
      lastName: 'Me',
      role: 'DEVELOPER',
    });

    const found = await repository.findByEmail('findme@example.com');
    expect(found).toBeDefined();
    expect(found?.email).toBe('findme@example.com');
  });
});
