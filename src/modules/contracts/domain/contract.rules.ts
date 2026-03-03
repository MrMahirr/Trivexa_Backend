import { ContractStatus } from './contract.entity';
import { InvalidContractStatusException } from './contract.errors';

export class ContractRules {
  static validateStatusTransition(
    currentStatus: ContractStatus,
    nextStatus: ContractStatus,
  ) {
    const validTransitions: Record<ContractStatus, ContractStatus[]> = {
      [ContractStatus.DRAFT]: [
        ContractStatus.PENDING_APPROVAL,
        ContractStatus.APPROVED,
        ContractStatus.TERMINATED,
      ],
      [ContractStatus.PENDING_APPROVAL]: [
        ContractStatus.APPROVED,
        ContractStatus.DRAFT,
        ContractStatus.TERMINATED,
      ],
      [ContractStatus.APPROVED]: [
        ContractStatus.SIGNED,
        ContractStatus.TERMINATED,
      ],
      [ContractStatus.SIGNED]: [
        ContractStatus.EXPIRED,
        ContractStatus.TERMINATED,
      ],
      [ContractStatus.EXPIRED]: [],
      [ContractStatus.TERMINATED]: [],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new InvalidContractStatusException(
        `Cannot transition contract status from ${currentStatus} to ${nextStatus}`,
      );
    }
  }

  static validateDates(startDate: Date, endDate?: Date) {
    if (endDate && startDate > endDate) {
      return false;
    }
    return true;
  }
}
