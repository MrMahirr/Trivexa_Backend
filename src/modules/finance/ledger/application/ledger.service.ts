import { Injectable } from '@nestjs/common';

import { PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { TransactionManager } from '../../../../database/transaction';
import {
  AccountType,
  LedgerAccountEntity,
} from '../domain/ledger-account.entity';
import { EntryType } from '../domain/ledger-entry.entity';
import { LedgerRepository } from '../infrastructure/ledger.repository';
import { DomainError, DomainErrorType } from "../../../../shared/errors/domain.error";

export interface TransactionEntryData {
  accountCode: string;
  amount: number; // Always positive
  type: EntryType;
  description: string;
  referenceType?: string;
  referenceId?: string;
}

@Injectable()
export class LedgerService {
  constructor(
    private readonly ledgerRepository: LedgerRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async recordTransaction(
    entries: TransactionEntryData[],
    client?: PoolClient,
  ): Promise<string> {
    // Validation: Total Debit must equal Total Credit
    const totalDebit = entries
      .filter((e) => e.type === EntryType.DEBIT)
      .reduce((sum, e) => sum + e.amount, 0);

    const totalCredit = entries
      .filter((e) => e.type === EntryType.CREDIT)
      .reduce((sum, e) => sum + e.amount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      // Tolerance for floating point
      throw new DomainError(
        `Unbalanced transaction. Debit: ${totalDebit}, Credit: ${totalCredit}`, DomainErrorType.BUSINESS_RULE);
    }

    const transactionId = uuidv4();

    const work = async (txClient: PoolClient) => {
      for (const entry of entries) {
        // Find account
        const account = await this.ledgerRepository.findAccountByCode(
          entry.accountCode,
          txClient,
        );
        if (!account) {
          throw new DomainError(
            `Account code ${entry.accountCode} not found`, DomainErrorType.BUSINESS_RULE);
        }

        // Create Entry
        await this.ledgerRepository.createEntry(
          {
            transactionId,
            accountId: account.id,
            amount: entry.amount,
            type: entry.type,
            description: entry.description,
            referenceType: entry.referenceType,
            referenceId: entry.referenceId,
          },
          txClient,
        );

        // Update Balance
        // Asset/Expense: Debit (+), Credit (-)
        // Liability/Equity/Revenue: Credit (+), Debit (-)
        let delta = 0;
        if ([AccountType.ASSET, AccountType.EXPENSE].includes(account.type)) {
          delta = entry.type === EntryType.DEBIT ? entry.amount : -entry.amount;
        } else {
          delta =
            entry.type === EntryType.CREDIT ? entry.amount : -entry.amount;
        }

        await this.ledgerRepository.updateAccountBalance(
          account.id,
          delta,
          txClient,
        );
      }
      return transactionId;
    };

    if (client) {
      return work(client);
    } else {
      return this.transactionManager.run(work);
    }
  }

  async createAccount(
    code: string,
    name: string,
    type: AccountType,
    description?: string,
  ): Promise<LedgerAccountEntity> {
    return this.ledgerRepository.createAccount({
      code,
      name,
      type,
      description,
    });
  }
}
