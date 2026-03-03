import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService, ClientNotFoundException } from './clients.service';
import { ClientsRepository } from '../infrastructure/clients.repository';
import { CreateClientUseCase } from './usecases/create-client.usecase';
import { UpdateClientUseCase } from './usecases/update-client.usecase';

describe('ClientsService (client-portal facade)', () => {
  let service: ClientsService;
  let clientsRepo: Partial<jest.Mocked<ClientsRepository>>;
  let createClientUseCase: Partial<jest.Mocked<CreateClientUseCase>>;
  let updateClientUseCase: Partial<jest.Mocked<UpdateClientUseCase>>;

  const mockClient: any = {
    id: 'client-1',
    companyName: 'Acme Corp',
    contactPerson: 'John Doe',
    email: 'john@acme.com',
    isActive: true,
  };

  beforeEach(async () => {
    clientsRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    createClientUseCase = {
      execute: jest.fn(),
    };

    updateClientUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: ClientsRepository, useValue: clientsRepo },
        { provide: CreateClientUseCase, useValue: createClientUseCase },
        { provide: UpdateClientUseCase, useValue: updateClientUseCase },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated client list', async () => {
      clientsRepo.findAll.mockResolvedValue({
        data: [mockClient],
        total: 1,
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should use default page and limit values', async () => {
      clientsRepo.findAll.mockResolvedValue({ data: [], total: 0 });

      await service.findAll({});

      expect(clientsRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 20 }),
      );
    });

    it('should calculate totalPages correctly', async () => {
      clientsRepo.findAll.mockResolvedValue({
        data: Array(10).fill(mockClient),
        total: 25,
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.meta.totalPages).toBe(3); // ceil(25/10)
    });
  });

  describe('findById', () => {
    it('should return client if found', async () => {
      clientsRepo.findById.mockResolvedValue(mockClient);

      const result = await service.findById('client-1');

      expect(result).toEqual(mockClient);
    });

    it('should throw ClientNotFoundException if not found', async () => {
      clientsRepo.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        ClientNotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should delegate to CreateClientUseCase', async () => {
      createClientUseCase.execute.mockResolvedValue(mockClient);

      const result = await service.create({
        companyName: 'Acme',
        contactPerson: 'John',
        email: 'j@a.com',
      } as any);

      expect(result).toEqual(mockClient);
      expect(createClientUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should delegate to UpdateClientUseCase', async () => {
      const updated = { ...mockClient, contactPerson: 'Jane' };
      updateClientUseCase.execute.mockResolvedValue(updated);

      const result = await service.update('client-1', {
        contactPerson: 'Jane',
      } as any);

      expect(result).toEqual(updated);
      expect(updateClientUseCase.execute).toHaveBeenCalledWith('client-1', {
        contactPerson: 'Jane',
      });
    });
  });
});
