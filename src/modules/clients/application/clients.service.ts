import { Injectable, Logger } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientsRepository } from '../infrastructure/clients.repository';
import { CreateClientDto } from '../api/dto/create-client.dto';
import { UpdateClientDto } from '../api/dto/update-client.dto';

export class ClientNotFoundException extends HttpException {
    constructor() {
        super('Client not found', HttpStatus.NOT_FOUND);
    }
}

export class ClientAlreadyExistsException extends HttpException {
    constructor(field: string) {
        super(`A client with this ${field} already exists`, HttpStatus.CONFLICT);
    }
}

@Injectable()
export class ClientsService {
    private readonly logger = new Logger(ClientsService.name);

    constructor(private readonly clientsRepo: ClientsRepository) { }

    async findAll(query: { page?: number; limit?: number; search?: string; isActive?: string }) {
        const page = query.page || 1;
        const limit = query.limit || 20;

        const { data, total } = await this.clientsRepo.findAll({
            page,
            limit,
            search: query.search,
            isActive: query.isActive,
        });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findById(id: string) {
        const client = await this.clientsRepo.findById(id);
        if (!client) throw new ClientNotFoundException();
        return client;
    }

    async create(dto: CreateClientDto) {
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

    async update(id: string, dto: UpdateClientDto) {
        const client = await this.clientsRepo.findById(id);
        if (!client) throw new ClientNotFoundException();

        // Check email uniqueness if changing
        if (dto.email && dto.email !== client.email) {
            const existingEmail = await this.clientsRepo.findByEmail(dto.email);
            if (existingEmail) throw new ClientAlreadyExistsException('email');
        }

        // Check company name uniqueness if changing
        if (dto.companyName && dto.companyName !== client.companyName) {
            const existingCompany = await this.clientsRepo.findByCompanyName(dto.companyName);
            if (existingCompany) throw new ClientAlreadyExistsException('company name');
        }

        const updated = await this.clientsRepo.update(id, {
            companyName: dto.companyName,
            contactPerson: dto.contactPerson,
            email: dto.email,
            phone: dto.phone,
            address: dto.address,
        });

        this.logger.log(`Client updated: ${id}`);
        return updated;
    }
}
