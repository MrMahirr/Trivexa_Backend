import { Injectable } from '@nestjs/common';
import { ContractsRepository } from '../../infrastructure/contracts.repository';
import { ContractStatus } from '../../domain/contract.entity';
import { ContractNotFoundException } from '../../domain/contract.errors';
import { ContractRules } from '../../domain/contract.rules';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../shared/events/event.constants';

@Injectable()
export class UpdateStatusUseCase {
  constructor(
    private readonly contractsRepo: ContractsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    newStatus: ContractStatus,
    signedUrl?: string,
    userId?: string,
  ) {
    const contract = await this.contractsRepo.findById(id);
    if (!contract) {
      throw new ContractNotFoundException();
    }

    // Domain rules for status transition
    ContractRules.validateStatusTransition(contract.status, newStatus);

    const updatedContract = await this.contractsRepo.updateStatus(
      id,
      newStatus,
      signedUrl,
    );

    if (newStatus === ContractStatus.SIGNED) {
      this.eventEmitter.emit(SystemEvents.CONTRACT_SIGNED, {
        contractId: id,
        clientId: updatedContract?.clientId,
        timestamp: new Date(),
      });
    }

    this.eventEmitter.emit(SystemEvents.AUDIT_LOG_CREATED, {
      action: 'CONTRACT_STATUS_UPDATED',
      entityName: 'contract',
      entityId: id,
      userId: userId || 'system',
      details: { oldStatus: contract.status, newStatus },
    });

    return updatedContract;
  }
}
