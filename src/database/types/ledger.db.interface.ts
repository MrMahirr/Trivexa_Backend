import { BaseDbEntity } from './base.interface';

export type AccountType =
  | 'ASSET'
  | 'LIABILITY'
  | 'EQUITY'
  | 'REVENUE'
  | 'EXPENSE';
export type EntryType = 'DEBIT' | 'CREDIT';

export interface LedgerAccountDb extends BaseDbEntity {
  code: string;
  name: string;
  type: AccountType;
  balance?: number;
  description?: string;
}

export interface LedgerEntryDb extends BaseDbEntity {
  transaction_id: string;
  account_id: string;
  amount: number;
  type: EntryType;
  description: string;
  date?: Date;
  reference_type?: string;
  reference_id?: string;
}
