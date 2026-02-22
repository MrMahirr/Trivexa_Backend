import { Test, TestingModule } from '@nestjs/testing';
import { UpdateClientUseCase } from './update-client.usecase';
import { ClientsRepository } from '../../infrastructure/clients.repository';
import { ClientNotFoundException, ClientAlreadyExistsException } from '../../application/clients.service';

describe('UpdateClientUseCase', () => {
    let useCase: UpdateClientUseCase;
    let clientsRepo: Partial<jest.Mocked<ClientsRepository>>;

    const existingClient: any = {
        id: 'client-1',
        companyName: 'Acme Corp',
        contactPerson: 'John Doe',
        email: 'john@acme.com',
        phone: '+905551234567',
        address: 'Istanbul, Turkey',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        clientsRepo = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findByCompanyName: jest.fn(),
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateClientUseCase,
                { provide: ClientsRepository, useValue: clientsRepo },
            ],
        }).compile();

        useCase = module.get<UpdateClientUseCase>(UpdateClientUseCase);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should update client successfully', async () => {
            const updateDto: any = { contactPerson: 'Jane Doe', phone: '+905559876543' };
            const updatedClient = { ...existingClient, ...updateDto };

            clientsRepo.findById.mockResolvedValue(existingClient);
            clientsRepo.update.mockResolvedValue(updatedClient);

            const result = await useCase.execute('client-1', updateDto);

            expect(result).toEqual(updatedClient);
            expect(clientsRepo.update).toHaveBeenCalledWith('client-1', expect.objectContaining({
                contactPerson: 'Jane Doe',
                phone: '+905559876543',
            }));
        });

        it('should throw ClientNotFoundException when client does not exist', async () => {
            clientsRepo.findById.mockResolvedValue(null);

            await expect(useCase.execute('non-existent', { contactPerson: 'X' } as any))
                .rejects.toThrow(ClientNotFoundException);

            expect(clientsRepo.update).not.toHaveBeenCalled();
        });

        it('should throw ClientAlreadyExistsException when updating to existing email', async () => {
            const updateDto: any = { email: 'taken@other.com' };

            clientsRepo.findById.mockResolvedValue(existingClient);
            clientsRepo.findByEmail.mockResolvedValue({ id: 'client-2' } as any); // another client

            await expect(useCase.execute('client-1', updateDto))
                .rejects.toThrow(ClientAlreadyExistsException);

            expect(clientsRepo.update).not.toHaveBeenCalled();
        });

        it('should skip email uniqueness check when email is not changing', async () => {
            const updateDto: any = { email: 'john@acme.com', contactPerson: 'Updated' }; // same email

            clientsRepo.findById.mockResolvedValue(existingClient);
            clientsRepo.update.mockResolvedValue({ ...existingClient, contactPerson: 'Updated' });

            await useCase.execute('client-1', updateDto);

            expect(clientsRepo.findByEmail).not.toHaveBeenCalled();
        });

        it('should throw ClientAlreadyExistsException when updating to existing company name', async () => {
            const updateDto: any = { companyName: 'Existing Corp' };

            clientsRepo.findById.mockResolvedValue(existingClient);
            clientsRepo.findByCompanyName.mockResolvedValue({ id: 'client-3' } as any);

            await expect(useCase.execute('client-1', updateDto))
                .rejects.toThrow(ClientAlreadyExistsException);

            expect(clientsRepo.update).not.toHaveBeenCalled();
        });

        it('should skip company name uniqueness check when name is not changing', async () => {
            const updateDto: any = { companyName: 'Acme Corp', phone: '+90111' }; // same name

            clientsRepo.findById.mockResolvedValue(existingClient);
            clientsRepo.update.mockResolvedValue({ ...existingClient, phone: '+90111' });

            await useCase.execute('client-1', updateDto);

            expect(clientsRepo.findByCompanyName).not.toHaveBeenCalled();
        });
    });
});
