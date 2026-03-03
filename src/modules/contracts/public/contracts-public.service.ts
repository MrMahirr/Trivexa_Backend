import { Injectable } from '@nestjs/common';
import { ContractsRepository } from '../infrastructure/contracts.repository';
import { ContractEntity } from '../domain/contract.entity';

@Injectable()
export class ContractsPublicService {
  constructor(private readonly contractsRepo: ContractsRepository) {}

  async findById(id: string): Promise<ContractEntity | null> {
    return this.contractsRepo.findById(id);
  }

  async exists(id: string): Promise<boolean> {
    const contract = await this.contractsRepo.findById(id);
    return !!contract;
  }

  async findByClientId(clientId: string): Promise<ContractEntity[]> {
    return this.contractsRepo.findAll({ clientId });
  }
}
