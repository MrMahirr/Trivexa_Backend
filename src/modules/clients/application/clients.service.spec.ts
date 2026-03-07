import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService, ClientNotFoundException } from './clients.service';
import { ClientsRepository } from '../infrastructure/clients.repository';
import { CreateClientUseCase } from './usecases/create-client.usecase';
import { UpdateClientUseCase } from './usecases/update-client.usecase';
import { CreateClientUserUseCase } from './usecases/create-client-user.usecase';
import { IssueClientAccessLinkUseCase } from './usecases/issue-client-access-link.usecase';
import { ProjectsRepository } from '../../projects/infrastructure/projects.repository';
import { MeetingsService } from '../../meetings/application/meetings.service';
import { ContractsService } from '../../contracts/application/contracts.service';
import { InvoicesService } from '../../finance/invoices/application/invoices.service';
import { PaymentsService } from '../../finance/payments/application/payments.service';
import { TicketsService } from '../../tickets/application/tickets.service';

describe('ClientsService', () => {
  let service: ClientsService;
  let clientsRepo: Partial<jest.Mocked<ClientsRepository>>;
  let createClientUseCase: Partial<jest.Mocked<CreateClientUseCase>>;
  let updateClientUseCase: Partial<jest.Mocked<UpdateClientUseCase>>;
  let createClientUserUseCase: Partial<jest.Mocked<CreateClientUserUseCase>>;
  let issueClientAccessLinkUseCase: Partial<
    jest.Mocked<IssueClientAccessLinkUseCase>
  >;
  let projectsRepo: Partial<jest.Mocked<ProjectsRepository>>;
  let meetingsService: Partial<jest.Mocked<MeetingsService>>;
  let contractsService: Partial<jest.Mocked<ContractsService>>;
  let invoicesService: Partial<jest.Mocked<InvoicesService>>;
  let paymentsService: Partial<jest.Mocked<PaymentsService>>;
  let ticketsService: Partial<jest.Mocked<TicketsService>>;

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
      setActiveStatus: jest.fn(),
    };

    createClientUseCase = {
      execute: jest.fn(),
    };

    updateClientUseCase = {
      execute: jest.fn(),
    };

    createClientUserUseCase = {
      execute: jest.fn(),
    };

    issueClientAccessLinkUseCase = {
      execute: jest.fn(),
    };

    projectsRepo = {
      findAll: jest.fn(),
    };
    meetingsService = {
      findAll: jest.fn(),
    };
    contractsService = {
      findAll: jest.fn(),
    };
    invoicesService = {
      findAll: jest.fn(),
    };
    paymentsService = {
      getPaymentsByInvoice: jest.fn(),
    };
    ticketsService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: ClientsRepository, useValue: clientsRepo },
        { provide: CreateClientUseCase, useValue: createClientUseCase },
        { provide: UpdateClientUseCase, useValue: updateClientUseCase },
        {
          provide: CreateClientUserUseCase,
          useValue: createClientUserUseCase,
        },
        {
          provide: IssueClientAccessLinkUseCase,
          useValue: issueClientAccessLinkUseCase,
        },
        { provide: ProjectsRepository, useValue: projectsRepo },
        { provide: MeetingsService, useValue: meetingsService },
        { provide: ContractsService, useValue: contractsService },
        { provide: InvoicesService, useValue: invoicesService },
        { provide: PaymentsService, useValue: paymentsService },
        { provide: TicketsService, useValue: ticketsService },
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
      clientsRepo.findAll!.mockResolvedValue({
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

    it('should normalize isActive values for repository filter', async () => {
      clientsRepo.findAll!.mockResolvedValue({ data: [], total: 0 });

      await service.findAll({ isActive: 'active' });
      expect(clientsRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );

      await service.findAll({ isActive: 'false' });
      expect(clientsRepo.findAll).toHaveBeenLastCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });
  });

  describe('findById', () => {
    it('should return client if found', async () => {
      clientsRepo.findById!.mockResolvedValue(mockClient);

      const result = await service.findById('client-1');

      expect(result).toEqual(mockClient);
    });

    it('should throw ClientNotFoundException if not found', async () => {
      clientsRepo.findById!.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        ClientNotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should delegate to CreateClientUseCase', async () => {
      createClientUseCase.execute!.mockResolvedValue(mockClient);

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
      updateClientUseCase.execute!.mockResolvedValue(updated);

      const result = await service.update('client-1', {
        contactPerson: 'Jane',
      } as any);

      expect(result).toEqual(updated);
      expect(updateClientUseCase.execute).toHaveBeenCalledWith('client-1', {
        contactPerson: 'Jane',
      });
    });
  });

  describe('activate / deactivate / remove', () => {
    it('should activate client', async () => {
      const activated = { ...mockClient, isActive: true };
      clientsRepo.setActiveStatus!.mockResolvedValue(activated);

      const result = await service.activate('client-1');

      expect(result).toEqual(activated);
      expect(clientsRepo.setActiveStatus).toHaveBeenCalledWith(
        'client-1',
        true,
      );
    });

    it('should deactivate client', async () => {
      const deactivated = { ...mockClient, isActive: false };
      clientsRepo.setActiveStatus!.mockResolvedValue(deactivated);

      const result = await service.deactivate('client-1');

      expect(result).toEqual(deactivated);
      expect(clientsRepo.setActiveStatus).toHaveBeenCalledWith(
        'client-1',
        false,
      );
    });

    it('should throw if activate target does not exist', async () => {
      clientsRepo.setActiveStatus!.mockResolvedValue(null);

      await expect(service.activate('missing-client')).rejects.toThrow(
        ClientNotFoundException,
      );
    });

    it('should soft-delete via remove()', async () => {
      const deactivated = { ...mockClient, isActive: false };
      clientsRepo.setActiveStatus!.mockResolvedValue(deactivated);

      const result = await service.remove('client-1');

      expect(result).toEqual(deactivated);
      expect(clientsRepo.setActiveStatus).toHaveBeenCalledWith(
        'client-1',
        false,
      );
    });
  });

  describe('getClientWorkspace', () => {
    it('should return categorized client workspace data', async () => {
      clientsRepo.findById!.mockResolvedValue(mockClient);
      projectsRepo.findAll!.mockResolvedValue({
        data: [
          {
            id: 'project-1',
            name: 'Acme Redesign',
            status: 'IN_PROGRESS',
          } as any,
        ],
        total: 1,
      });
      meetingsService.findAll!.mockResolvedValue([
        {
          id: 'meeting-1',
          title: 'Acme Haftalik',
        } as any,
      ]);
      contractsService.findAll!.mockResolvedValue([
        { id: 'contract-1', clientId: 'client-1' } as any,
      ]);
      invoicesService.findAll!.mockResolvedValue([
        {
          id: 'invoice-1',
          status: 'SENT',
          total: 1000,
        } as any,
      ]);
      paymentsService.getPaymentsByInvoice!.mockResolvedValue([
        {
          id: 'payment-1',
          amount: 400,
        } as any,
      ]);
      ticketsService.findAll!.mockResolvedValue({
        data: [
          {
            id: 'ticket-1',
            subject: 'Acme Redesign talebi',
            description: 'UI revize',
          } as any,
        ],
        total: 1,
      } as any);

      const result = await service.getClientWorkspace(
        'client-1',
        'user-1',
        'ADMIN',
      );

      expect(result.client.id).toBe('client-1');
      expect(result.projects).toHaveLength(1);
      expect(result.feedbacks).toHaveLength(1);
      expect(result.tickets).toHaveLength(1);
      expect(result.contracts).toHaveLength(1);
      expect(result.finance.invoices).toHaveLength(1);
      expect(result.finance.paymentsByInvoice).toHaveLength(1);
      expect(result.summary.totalInvoiced).toBe(1000);
      expect(result.summary.totalCollected).toBe(400);
      expect(result.summary.outstandingAmount).toBe(600);
    });
  });
});
