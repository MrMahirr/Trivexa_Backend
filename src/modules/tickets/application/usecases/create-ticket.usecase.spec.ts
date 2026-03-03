import { Test, TestingModule } from '@nestjs/testing';
import { CreateTicketUseCase } from './create-ticket.usecase';
import { TicketsRepository } from '../../infrastructure/tickets.repository';
import { CreateTicketDto } from '../../api/dto/create-ticket.dto';

describe('CreateTicketUseCase', () => {
  let useCase: CreateTicketUseCase;
  let ticketsRepo: Partial<jest.Mocked<TicketsRepository>>;

  beforeEach(async () => {
    ticketsRepo = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTicketUseCase,
        { provide: TicketsRepository, useValue: ticketsRepo },
      ],
    }).compile();

    useCase = module.get<CreateTicketUseCase>(CreateTicketUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create ticket successfully', async () => {
    const dto: CreateTicketDto = {
      subject: 'Test Ticket',
      description: 'Issue description',
      priority: 'HIGH',
      type: 'BUG',
    };

    const createdTicket = {
      id: 'ticket-1',
      ...dto,
      status: 'OPEN',
      createdBy: 'user-1',
    };

    ticketsRepo.create.mockResolvedValue(createdTicket as any);

    const result = await useCase.execute(dto, 'user-1');

    expect(ticketsRepo.create).toHaveBeenCalledWith({
      subject: dto.subject,
      description: dto.description,
      type: dto.type,
      priority: dto.priority,
      createdBy: 'user-1',
    });
    expect(result).toEqual(createdTicket);
  });
});
