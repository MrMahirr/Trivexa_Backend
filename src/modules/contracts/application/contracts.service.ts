import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContractDto } from '../api/dto/create-contract.dto';
import { Contract, ContractStatus } from '../domain/contract.entity';
import { ContractsRepository } from '../infrastructure/contracts.repository';
import { ContractNotFoundException } from '../domain/contract.errors';
import { CreateContractUseCase } from './usecases/create-contract.usecase';
import { UpdateStatusUseCase } from './usecases/update-status.usecase';
import { ListExpiringContractsUseCase } from './usecases/list-expiring-contracts.usecase';

@Injectable()
export class ContractsService {
  constructor(
    private readonly contractsRepository: ContractsRepository,
    private readonly createContractUseCase: CreateContractUseCase,
    private readonly updateStatusUseCase: UpdateStatusUseCase,
    private readonly listExpiringContractsUseCase: ListExpiringContractsUseCase,
  ) { }

  async create(dto: CreateContractDto, userId: string) {
    return this.createContractUseCase.execute(dto, userId);
  }

  async findAll(query: { clientId?: string; status?: ContractStatus }) {
    return this.contractsRepository.findAll(query);
  }

  async findById(id: string) {
    const contract = await this.contractsRepository.findById(id);
    if (!contract) throw new ContractNotFoundException();
    return contract;
  }

  async approve(id: string, userId?: string) {
    return this.updateStatusUseCase.execute(id, ContractStatus.APPROVED, null, userId);
  }

  async sign(id: string, signedUrl: string, userId?: string) {
    return this.updateStatusUseCase.execute(id, ContractStatus.SIGNED, signedUrl, userId);
  }

  async getExpiring(days?: number) {
    return this.listExpiringContractsUseCase.execute(days);
  }
}
