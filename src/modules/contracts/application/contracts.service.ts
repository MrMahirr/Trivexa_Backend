import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContractDto } from '../api/dto/create-contract.dto';
import { Contract, ContractStatus } from '../domain/contract.entity';
import { ContractsRepository } from '../infrastructure/contracts.repository';

@Injectable()
export class ContractsService {
  constructor(private readonly contractsRepository: ContractsRepository) {}

  async create(dto: CreateContractDto, userId: string) {
    const contract = new Contract();
    contract.clientId = dto.clientId;
    contract.title = dto.title;
    contract.description = dto.description;
    contract.startDate = new Date(dto.startDate);
    contract.endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    contract.value = dto.value;
    contract.status = dto.status || ContractStatus.DRAFT;
    contract.createdBy = userId;

    if (contract.endDate && contract.startDate > contract.endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    return this.contractsRepository.create(contract);
  }

  async findAll(query: { clientId?: string; status?: ContractStatus }) {
    return this.contractsRepository.findAll(query);
  }

  async findById(id: string) {
    const contract = await this.contractsRepository.findById(id);
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async approve(id: string) {
    const contract = await this.findById(id);
    if (
      contract.status !== ContractStatus.PENDING_APPROVAL &&
      contract.status !== ContractStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Contract is not in a state to be approved',
      );
    }
    return this.contractsRepository.updateStatus(id, ContractStatus.APPROVED);
  }

  async sign(id: string, signedUrl: string) {
    const contract = await this.findById(id);
    if (contract.status !== ContractStatus.APPROVED) {
      throw new BadRequestException('Contract must be APPROVED before signing');
    }
    return this.contractsRepository.updateStatus(
      id,
      ContractStatus.SIGNED,
      signedUrl,
    );
  }
}
