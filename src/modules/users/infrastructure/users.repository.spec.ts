import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { DatabasePool } from '../../../database/pool';
import { CacheService } from '../../../infrastructure/cache/cache.service';
import { BaseQuery } from '../../../database/query/base-query';
import { User } from '../domain/user.entity';

describe('UsersRepository', () => {
    let repository: UsersRepository;
    let dbPool: Partial<DatabasePool>;
    let cacheService: Partial<CacheService>;
    let mockClient: any;

    beforeEach(async () => {
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };

        dbPool = {
            getPool: jest.fn().mockReturnValue({
                connect: jest.fn().mockResolvedValue(mockClient),
            }),
        };

        cacheService = {
            getOrSet: jest.fn().mockImplementation((key, fn) => fn()),
            del: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersRepository,
                { provide: DatabasePool, useValue: dbPool },
                { provide: CacheService, useValue: cacheService },
            ],
        }).compile();

        repository = module.get<UsersRepository>(UsersRepository);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('findById', () => {
        it('should return user if found', async () => {
            const mockRow = {
                id: 'u1',
                email: 'test@example.com',
                created_at: new Date(),
                updated_at: new Date(),
            };
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

            const result = await repository.findById('u1');

            expect(result).toBeDefined();
            expect(result?.id).toBe('u1');
            expect(BaseQuery.queryOne).toHaveBeenCalled();
        });

        it('should use cache', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(null);
            await repository.findById('u1');
            expect(cacheService.getOrSet).toHaveBeenCalled();
        });
    });

    describe('findByEmail', () => {
        it('should return user if found', async () => {
            const mockRow = { id: 'u1', email: 'test@example.com' };
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);
            const result = await repository.findByEmail('test@example.com');
            expect(result).toBeDefined();
        });
    });

    describe('create', () => {
        it('should create user', async () => {
            const mockRow = { id: 'new', email: 'new@example.com' };
            const queryOneSpy = jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

            const result = await repository.create({
                email: 'new@example.com',
                passwordHash: 'hash',
                firstName: 'First',
                lastName: 'Last',
                role: 'USER',
                department: 'IT',
            });

            expect(queryOneSpy).toHaveBeenCalled();
            expect(result.id).toBe('new');
        });
    });
});
