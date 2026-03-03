import { Test, TestingModule } from '@nestjs/testing';
import { ClientsRepository } from './clients.repository';
import { DatabasePool } from '../../../database/pool';
import { BaseQuery } from '../../../database/query/base-query';

describe('ClientsRepository', () => {
  let repository: ClientsRepository;
  let dbPool: Partial<DatabasePool>;
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsRepository,
        { provide: DatabasePool, useValue: dbPool },
      ],
    }).compile();

    repository = module.get<ClientsRepository>(ClientsRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({ count: '15' });
      jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue([
        {
          id: 'c1',
          company_name: 'Corp A',
          contact_person: 'A',
          email: 'a@a.com',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'c2',
          company_name: 'Corp B',
          contact_person: 'B',
          email: 'b@b.com',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.total).toBe(15);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].companyName).toBe('Corp A');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should apply search filter', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({ count: '0' });
      jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue([]);

      await repository.findAll({ page: 1, limit: 10, search: 'acme' });

      expect(BaseQuery.queryMany).toHaveBeenCalledWith(
        mockClient,
        expect.stringContaining('LIKE'),
        expect.arrayContaining(['%acme%']),
      );
    });

    it('should apply isActive filter', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({ count: '0' });
      jest.spyOn(BaseQuery, 'queryMany').mockResolvedValue([]);

      await repository.findAll({ page: 1, limit: 10, isActive: 'true' });

      expect(BaseQuery.queryOne).toHaveBeenCalledWith(
        mockClient,
        expect.stringContaining('is_active'),
        expect.arrayContaining([true]),
      );
    });
  });

  describe('findById', () => {
    it('should return client if found', async () => {
      const mockRow = {
        id: 'c1',
        company_name: 'Acme',
        contact_person: 'John',
        email: 'john@acme.com',
        phone: '+90555',
        address: 'Istanbul',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

      const result = await repository.findById('c1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('c1');
      expect(result?.companyName).toBe('Acme');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return null if not found', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return client by email', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({
        id: 'c1',
        company_name: 'X',
        contact_person: 'Y',
        email: 'test@test.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await repository.findByEmail('test@test.com');

      expect(result?.email).toBe('test@test.com');
      expect(BaseQuery.queryOne).toHaveBeenCalledWith(
        mockClient,
        expect.stringContaining('email'),
        ['test@test.com'],
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return null when email not found', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(null);

      const result = await repository.findByEmail('nope@nope.com');

      expect(result).toBeNull();
    });
  });

  describe('findByCompanyName', () => {
    it('should return client by company name', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue({
        id: 'c1',
        company_name: 'Acme Corp',
        contact_person: 'Y',
        email: 'y@y.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await repository.findByCompanyName('Acme Corp');

      expect(result?.companyName).toBe('Acme Corp');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should insert and return new client', async () => {
      const mockRow = {
        id: 'new-client',
        company_name: 'New Corp',
        contact_person: 'Alice',
        email: 'alice@new.com',
        phone: null,
        address: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

      const result = await repository.create({
        companyName: 'New Corp',
        contactPerson: 'Alice',
        email: 'alice@new.com',
      });

      expect(result.id).toBe('new-client');
      expect(result.companyName).toBe('New Corp');
      expect(BaseQuery.queryOne).toHaveBeenCalledWith(
        mockClient,
        expect.stringContaining('INSERT INTO clients'),
        ['New Corp', 'Alice', 'alice@new.com', null, null],
      );
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update fields dynamically', async () => {
      const mockRow = {
        id: 'c1',
        company_name: 'Updated Corp',
        contact_person: 'Bob',
        email: 'bob@up.com',
        phone: '+90123',
        address: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

      const result = await repository.update('c1', {
        companyName: 'Updated Corp',
        contactPerson: 'Bob',
      });

      expect(result?.companyName).toBe('Updated Corp');
      expect(BaseQuery.queryOne).toHaveBeenCalledWith(
        mockClient,
        expect.stringContaining('UPDATE clients SET'),
        expect.arrayContaining(['Updated Corp', 'Bob', 'c1']),
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return findById result when no fields to update', async () => {
      const mockRow = {
        id: 'c1',
        company_name: 'X',
        contact_person: 'Y',
        email: 'y@y.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(mockRow);

      const result = await repository.update('c1', {});

      // Should call findById instead of UPDATE query
      expect(result?.id).toBe('c1');
    });

    it('should return null if client not found during update', async () => {
      jest.spyOn(BaseQuery, 'queryOne').mockResolvedValue(null);

      const result = await repository.update('non-existent', {
        companyName: 'X',
      });

      expect(result).toBeNull();
    });
  });
});
