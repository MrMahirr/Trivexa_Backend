import { Injectable } from '@nestjs/common';
import { CreateContractDto } from '../../api/dto/create-contract.dto';
import { Contract, ContractStatus } from '../../domain/contract.entity';
import { ContractsRepository } from '../../infrastructure/contracts.repository';
import { InvalidContractDateException } from '../../domain/contract.errors';
import { ContractRules } from '../../domain/contract.rules';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class CreateContractUseCase {
  constructor(
    private readonly contractsRepo: ContractsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateContractDto, userId: string) {
    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    if (!ContractRules.validateDates(startDate, endDate)) {
      throw new InvalidContractDateException();
    }

    const contractProps = new Contract();
    contractProps.clientId = dto.clientId;
    contractProps.title = dto.title;
    contractProps.description = dto.description;
    contractProps.startDate = startDate;
    contractProps.endDate = endDate;
    contractProps.value = dto.value;
    contractProps.status = dto.status || ContractStatus.DRAFT;
    contractProps.createdBy = userId;

    const createdContract = await this.contractsRepo.create(contractProps);

    this.eventEmitter.emit(SystemEvents.CONTRACT_CREATED, {
      contractId: createdContract.id,
      clientId: createdContract.clientId,
      createdBy: userId,
      timestamp: new Date(),
    });

    this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
      action: 'CONTRACT_CREATED',
      entityName: 'contract',
      entityId: createdContract.id,
      userId: userId,
      details: { title: createdContract.title },
    });

    return createdContract;
  }
}
