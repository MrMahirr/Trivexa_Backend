import { Test, TestingModule } from '@nestjs/testing';
import { ListTicketsUseCase } from './list-tickets.usecase';
import { TicketsRepository } from '../../infrastructure/tickets.repository';

describe('ListTicketsUseCase', () => {
    let useCase: ListTicketsUseCase;
    let ticketsRepo: Partial<jest.Mocked<TicketsRepository>>;

    beforeEach(async () => {
        ticketsRepo = {
            findAll: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListTicketsUseCase,
                { provide: TicketsRepository, useValue: ticketsRepo },
            ],
        }).compile();

        useCase = module.get<ListTicketsUseCase>(ListTicketsUseCase);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should return all tickets for ADMIN', async () => {
        const tickets = [{ id: 'ticket-1' }];
        ticketsRepo.findAll.mockResolvedValue({ data: tickets as any, total: 1 });

        const result = await useCase.execute({}, 'admin-1', 'ADMIN');

        expect(ticketsRepo.findAll).toHaveBeenCalledWith({}, undefined); // undefined filterUserId signifies all
        expect(result).toEqual({ data: tickets, total: 1 });
    });

    it('should return own tickets for USER', async () => {
        const tickets = [{ id: 'ticket-1' }];
        ticketsRepo.findAll.mockResolvedValue({ data: tickets as any, total: 1 });

        const result = await useCase.execute({}, 'user-1', 'USER');

        expect(ticketsRepo.findAll).toHaveBeenCalledWith({}, 'user-1');
        expect(result).toEqual({ data: tickets, total: 1 });
    });
});
