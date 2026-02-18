import { Injectable, Logger } from '@nestjs/common';
import { ClientsRepository } from '../../infrastructure/clients.repository';
import { CreateClientDto } from '../../api/dto/create-client.dto';
import { ClientAlreadyExistsException } from '../../application/clients.service';
// Note: ClientAlreadyExistsException is currently defined in ClientsService. 
// We should probably move it to a shared errors file or domain/errors.ts.
// For now, I will import it from there or define a new one if it's not exported well.
// Checking ClientsService, it IS exported. But circular dependency might be an issue if Service imports UseCase and UseCase imports Service (for exception).
// Best practice: Move exceptions to `domain/client.errors.ts`.
// I will create `domain/client.errors.ts` first or just define it here/import if I can move it.
// Let's create `domain/client.errors.ts` to be clean.

@Injectable()
export class CreateClientUseCase {
    private readonly logger = new Logger(CreateClientUseCase.name);

    constructor(private readonly clientsRepo: ClientsRepository) { }

    async execute(dto: CreateClientDto) {
        // Check email uniqueness
        const existingEmail = await this.clientsRepo.findByEmail(dto.email);
        if (existingEmail) throw new ClientAlreadyExistsException('email');

        // Check company name uniqueness
        const existingCompany = await this.clientsRepo.findByCompanyName(dto.companyName);
        if (existingCompany) throw new ClientAlreadyExistsException('company name');

        const client = await this.clientsRepo.create({
            companyName: dto.companyName,
            contactPerson: dto.contactPerson,
            email: dto.email,
            phone: dto.phone,
            address: dto.address,
        });

        this.logger.log(`Client created: ${client.companyName}`);
        return client;
    }
}
