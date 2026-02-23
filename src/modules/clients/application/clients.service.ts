import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientsRepository } from '../infrastructure/clients.repository';
import { CreateClientDto } from '../api/dto/create-client.dto';
import { UpdateClientDto } from '../api/dto/update-client.dto';
import { CreateClientUseCase } from './usecases/create-client.usecase';
import { UpdateClientUseCase } from './usecases/update-client.usecase';

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
  constructor(
    private readonly clientsRepo: ClientsRepository,
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: string;
  }) {
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
    const client = await this.createClientUseCase.execute(dto);
    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    const updated = await this.updateClientUseCase.execute(id, dto);
    return updated;
  }
}
