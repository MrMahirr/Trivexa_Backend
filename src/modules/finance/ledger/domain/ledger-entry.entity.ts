export enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export interface LedgerEntryEntity {
  id: string;
  transactionId: string;
  accountId: string;
  amount: number;
  type: EntryType;
  description: string;
  date: Date;
  referenceType?: string; // e.g., 'INVOICE', 'PAYMENT'
  referenceId?: string;
  createdAt: Date;
}

export class LedgerEntry {
  static fromRow(row: any): LedgerEntryEntity {
    return {
      id: row.id,
      transactionId: row.transaction_id,
      accountId: row.account_id,
      amount: parseFloat(row.amount),
      type: row.type as EntryType,
      description: row.description,
      date: row.date,
      referenceType: row.reference_type,
      referenceId: row.reference_id,
      createdAt: row.created_at,
    };
  }
}
