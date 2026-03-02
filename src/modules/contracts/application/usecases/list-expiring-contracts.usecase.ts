import { Injectable } from '@nestjs/common';
import { ContractsRepository } from '../../infrastructure/contracts.repository';

@Injectable()
export class ListExpiringContractsUseCase {
  constructor(private readonly contractsRepo: ContractsRepository) {}

  /**
   * Returns contracts that are expiring within the given next number of days.
   * @param days default is 30 days
   */
  async execute(days: number = 30) {
    return this.contractsRepo.findExpiringContracts(days);
  }
}
