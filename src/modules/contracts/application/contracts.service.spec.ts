import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsRepository } from '../infrastructure/contracts.repository';
import { ContractStatus } from '../domain/contract.entity';

describe('ContractsService', () => {
  let service: ContractsService;
  let contractsRepo: Partial<jest.Mocked<ContractsRepository>>;

  const mockContract: any = {
    id: 'contract-1',
    clientId: 'client-1',
    title: 'SEO Agreement',
    description: 'SEO services for 12 months',
    status: ContractStatus.DRAFT,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    value: 10000,
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateDto: any = {
    clientId: 'client-1',
    title: 'SEO Agreement',
    description: 'SEO services for 12 months',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    value: 10000,
  };

  beforeEach(async () => {
    contractsRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: ContractsRepository, useValue: contractsRepo },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create contract with DRAFT status by default', async () => {
      contractsRepo.create.mockResolvedValue(mockContract);

      const result = await service.create(mockCreateDto, 'user-1');

      expect(result).toEqual(mockContract);
      expect(contractsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'client-1',
          title: 'SEO Agreement',
          status: ContractStatus.DRAFT,
          createdBy: 'user-1',
        }),
      );
    });

    it('should throw BadRequestException when endDate is before startDate', async () => {
      const invalidDto: any = {
        ...mockCreateDto,
        startDate: '2026-12-31',
        endDate: '2026-01-01', // before start
      };

      await expect(service.create(invalidDto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );

      expect(contractsRepo.create).not.toHaveBeenCalled();
    });

    it('should create contract without endDate', async () => {
      const dtoNoEnd: any = { ...mockCreateDto, endDate: undefined };
      contractsRepo.create.mockResolvedValue({
        ...mockContract,
        endDate: undefined,
      });

      const result = await service.create(dtoNoEnd, 'user-1');

      expect(result).toBeDefined();
      expect(contractsRepo.create).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return contract if found', async () => {
      contractsRepo.findById.mockResolvedValue(mockContract);

      const result = await service.findById('contract-1');

      expect(result).toEqual(mockContract);
    });

    it('should throw NotFoundException if not found', async () => {
      contractsRepo.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should delegate to repository with filters', async () => {
      contractsRepo.findAll.mockResolvedValue([mockContract]);

      const result = await service.findAll({
        clientId: 'client-1',
        status: ContractStatus.DRAFT,
      });

      expect(result).toHaveLength(1);
      expect(contractsRepo.findAll).toHaveBeenCalledWith({
        clientId: 'client-1',
        status: ContractStatus.DRAFT,
      });
    });
  });

  describe('approve', () => {
    it('should approve a DRAFT contract', async () => {
      contractsRepo.findById.mockResolvedValue({
        ...mockContract,
        status: ContractStatus.DRAFT,
      });
      contractsRepo.updateStatus.mockResolvedValue({
        ...mockContract,
        status: ContractStatus.APPROVED,
      });

      const result = await service.approve('contract-1');

      expect(result?.status).toBe(ContractStatus.APPROVED);
      expect(contractsRepo.updateStatus).toHaveBeenCalledWith(
        'contract-1',
        ContractStatus.APPROVED,
      );
    });

    it('should approve a PENDING_APPROVAL contract', async () => {
      contractsRepo.findById.mockResolvedValue({
        ...mockContract,
        status: ContractStatus.PENDING_APPROVAL,
      });
      contractsRepo.updateStatus.mockResolvedValue({
        ...mockContract,
        status: ContractStatus.APPROVED,
      });

      await service.approve('contract-1');

      expect(contractsRepo.updateStatus).toHaveBeenCalledWith(
        'contract-1',
        ContractStatus.APPROVED,
      );
    });

    it('should throw BadRequestException when contract is already SIGNED', async () => {
      contractsRepo.findById.mockResolvedValue({
        ...mockContract,
        status: ContractStatus.SIGNED,
      });

      await expect(service.approve('contract-1')).rejects.toThrow(
        BadRequestException,
      );

      expect(contractsRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when contract not found', async () => {
      contractsRepo.findById.mockResolvedValue(null);

      await expect(service.approve('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('sign', () => {
    it('should sign an APPROVED contract', async () => {
      contractsRepo.findById.mockResolvedValue({
        ...mockContract,
        status: ContractStatus.APPROVED,
      });
      contractsRepo.updateStatus.mockResolvedValue({
        ...mockContract,
        status: ContractStatus.SIGNED,
        signedUrl: 'https://example.com/signed.pdf',
      });

      const result = await service.sign(
        'contract-1',
        'https://example.com/signed.pdf',
      );

      expect(result?.status).toBe(ContractStatus.SIGNED);
      expect(contractsRepo.updateStatus).toHaveBeenCalledWith(
        'contract-1',
        ContractStatus.SIGNED,
        'https://example.com/signed.pdf',
      );
    });

    it('should throw BadRequestException when contract is not APPROVED', async () => {
      contractsRepo.findById.mockResolvedValue({
        ...mockContract,
        status: ContractStatus.DRAFT,
      });

      await expect(
        service.sign('contract-1', 'https://example.com/signed.pdf'),
      ).rejects.toThrow(BadRequestException);

      expect(contractsRepo.updateStatus).not.toHaveBeenCalled();
    });
  });
});
