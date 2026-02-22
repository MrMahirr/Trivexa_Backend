import { Test, TestingModule } from '@nestjs/testing';
import { ContractsRepository } from './contracts.repository';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';
import { ContractStatus } from '../domain/contract.entity';

describe('ContractsRepository', () => {
    let repository: ContractsRepository;
    let dbPool: Partial<DatabasePool>;
    let mockClient: any;

    const mockRow: any = {
        id: 'contract-1',
        client_id: 'client-1',
        title: 'SEO Agreement',
        description: 'SEO services',
        status: 'DRAFT',
        start_date: new Date('2026-01-01'),
        end_date: new Date('2026-12-31'),
        value: '10000',
        signed_url: null,
        created_by: 'user-1',
        created_at: new Date(),
        updated_at: new Date(),
    };

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

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContractsRepository,
                { provide: DatabasePool, useValue: dbPool },
            ],
        }).compile();

        repository = module.get<ContractsRepository>(ContractsRepository);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('create', () => {
        it('should insert and return new contract', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

            const contractData: any = {
                clientId: 'client-1',
                title: 'SEO Agreement',
                description: 'SEO services',
                status: ContractStatus.DRAFT,
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-12-31'),
                value: 10000,
                createdBy: 'user-1',
            };

            const result = await repository.create(contractData);

            expect(result.id).toBe('contract-1');
            expect(result.title).toBe('SEO Agreement');
            expect(result.value).toBe(10000);
            expect(BaseQuery.queryOne).toHaveBeenCalledWith(
                mockClient,
                expect.stringContaining('INSERT INTO contracts'),
                expect.arrayContaining(['client-1', 'SEO Agreement']),
            );
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should use provided client and not release it', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);
            const externalClient: any = { query: jest.fn(), release: jest.fn() };

            await repository.create({ clientId: 'c1', title: 'T', status: ContractStatus.DRAFT, startDate: new Date() } as any, externalClient);

            expect(externalClient.release).not.toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return contract if found', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

            const result = await repository.findById('contract-1');

            expect(result).toBeDefined();
            expect(result?.id).toBe('contract-1');
            expect(result?.clientId).toBe('client-1');
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should return null if not found', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(null);

            const result = await repository.findById('non-existent');

            expect(result).toBeNull();
            expect(mockClient.release).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return all contracts without filters', async () => {
            jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue([mockRow]);

            const result = await repository.findAll({});

            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('SEO Agreement');
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should filter by clientId', async () => {
            jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue([]);

            await repository.findAll({ clientId: 'client-1' });

            expect(BaseQuery.queryMany).toHaveBeenCalledWith(
                mockClient,
                expect.stringContaining('client_id'),
                expect.arrayContaining(['client-1']),
            );
        });

        it('should filter by status', async () => {
            jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue([]);

            await repository.findAll({ status: ContractStatus.APPROVED });

            expect(BaseQuery.queryMany).toHaveBeenCalledWith(
                mockClient,
                expect.stringContaining('status'),
                expect.arrayContaining([ContractStatus.APPROVED]),
            );
        });
    });

    describe('updateStatus', () => {
        it('should update status and return contract', async () => {
            const updatedRow = { ...mockRow, status: 'APPROVED' };
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(updatedRow);

            const result = await repository.updateStatus('contract-1', ContractStatus.APPROVED);

            expect(result?.status).toBe(ContractStatus.APPROVED);
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should update status with signedUrl', async () => {
            const signedRow = { ...mockRow, status: 'SIGNED', signed_url: 'https://example.com/doc.pdf' };
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(signedRow);

            const result = await repository.updateStatus('contract-1', ContractStatus.SIGNED, 'https://example.com/doc.pdf');

            expect(result?.status).toBe(ContractStatus.SIGNED);
            expect(result?.signedUrl).toBe('https://example.com/doc.pdf');
            expect(BaseQuery.queryOne).toHaveBeenCalledWith(
                mockClient,
                expect.stringContaining('signed_url'),
                expect.arrayContaining(['https://example.com/doc.pdf']),
            );
        });

        it('should return null if contract not found', async () => {
            jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(null);

            const result = await repository.updateStatus('non-existent', ContractStatus.APPROVED);

            expect(result).toBeNull();
        });
    });
});
