import { Test, TestingModule } from '@nestjs/testing';
import { CreateClientUseCase } from './create-client.usecase';
import { ClientsRepository } from '../../infrastructure/clients.repository';
import { ClientAlreadyExistsException } from '../../application/clients.service';

describe('CreateClientUseCase', () => {
    let useCase: CreateClientUseCase;
    let clientsRepo: Partial<jest.Mocked<ClientsRepository>>;

    const mockDto: any = {
        companyName: 'Acme Corp',
        contactPerson: 'John Doe',
        email: 'john@acme.com',
        phone: '+905551234567',
        address: 'Istanbul, Turkey',
    };

    const mockCreatedClient: any = {
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
            findByEmail: jest.fn(),
            findByCompanyName: jest.fn(),
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateClientUseCase,
                { provide: ClientsRepository, useValue: clientsRepo },
            ],
        }).compile();

        useCase = module.get<CreateClientUseCase>(CreateClientUseCase);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should create client successfully when email and company name are unique', async () => {
            clientsRepo.findByEmail.mockResolvedValue(null);
            clientsRepo.findByCompanyName.mockResolvedValue(null);
            clientsRepo.create.mockResolvedValue(mockCreatedClient);

            const result = await useCase.execute(mockDto);

            expect(result).toEqual(mockCreatedClient);
            expect(clientsRepo.findByEmail).toHaveBeenCalledWith('john@acme.com');
            expect(clientsRepo.findByCompanyName).toHaveBeenCalledWith('Acme Corp');
            expect(clientsRepo.create).toHaveBeenCalledWith({
                companyName: 'Acme Corp',
                contactPerson: 'John Doe',
                email: 'john@acme.com',
                phone: '+905551234567',
                address: 'Istanbul, Turkey',
            });
        });

        it('should throw ClientAlreadyExistsException when email already exists', async () => {
            clientsRepo.findByEmail.mockResolvedValue(mockCreatedClient);

            await expect(useCase.execute(mockDto)).rejects.toThrow(ClientAlreadyExistsException);

            expect(clientsRepo.findByEmail).toHaveBeenCalledWith('john@acme.com');
            expect(clientsRepo.create).not.toHaveBeenCalled();
        });

        it('should throw ClientAlreadyExistsException when company name already exists', async () => {
            clientsRepo.findByEmail.mockResolvedValue(null);
            clientsRepo.findByCompanyName.mockResolvedValue(mockCreatedClient);

            await expect(useCase.execute(mockDto)).rejects.toThrow(ClientAlreadyExistsException);

            expect(clientsRepo.findByCompanyName).toHaveBeenCalledWith('Acme Corp');
            expect(clientsRepo.create).not.toHaveBeenCalled();
        });

        it('should create client without optional fields', async () => {
            const minimalDto: any = {
                companyName: 'Minimal Corp',
                contactPerson: 'Jane',
                email: 'jane@minimal.com',
            };

            clientsRepo.findByEmail.mockResolvedValue(null);
            clientsRepo.findByCompanyName.mockResolvedValue(null);
            clientsRepo.create.mockResolvedValue({ id: 'client-2', ...minimalDto } as any);

            const result = await useCase.execute(minimalDto);

            expect(result.id).toBe('client-2');
            expect(clientsRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    companyName: 'Minimal Corp',
                    contactPerson: 'Jane',
                    email: 'jane@minimal.com',
                }),
            );
        });
    });
});
