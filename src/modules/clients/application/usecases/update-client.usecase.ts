import { Injectable, Logger } from '@nestjs/common';
import { ClientsRepository } from '../../infrastructure/clients.repository';
import { UpdateClientDto } from '../../api/dto/update-client.dto';
import {
  ClientNotFoundException,
  ClientAlreadyExistsException,
} from '../../application/clients.service';

@Injectable()
export class UpdateClientUseCase {
  private readonly logger = new Logger(UpdateClientUseCase.name);

  constructor(private readonly clientsRepo: ClientsRepository) {}

  async execute(id: string, dto: UpdateClientDto) {
    const client = await this.clientsRepo.findById(id);
    if (!client) throw new ClientNotFoundException();

    // Check email uniqueness if changing
    if (dto.email && dto.email !== client.email) {
      const existingEmail = await this.clientsRepo.findByEmail(dto.email);
      if (existingEmail) throw new ClientAlreadyExistsException('email');
    }

    // Check company name uniqueness if changing
    if (dto.companyName && dto.companyName !== client.companyName) {
      const existingCompany = await this.clientsRepo.findByCompanyName(
        dto.companyName,
      );
      if (existingCompany)
        throw new ClientAlreadyExistsException('company name');
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
