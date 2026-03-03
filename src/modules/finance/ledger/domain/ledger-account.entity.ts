export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum AccountCode {
  // Assets
  CASH = '100',
  BANK = '102',
  ACCOUNTS_RECEIVABLE = '120',

  // Liabilities
  ACCOUNTS_PAYABLE = '320',
  TAX_PAYABLE = '360',

  // Equity
  OWNERS_EQUITY = '500',

  // Revenue
  SALES_REVENUE = '600',
  SERVICE_REVENUE = '601',

  // Expenses
  OPERATING_EXPENSE = '770',
  SALARIES_EXPENSE = '720',
  RENT_EXPENSE = '730',
}

export interface LedgerAccountEntity {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  balance: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class LedgerAccount {
  static fromRow(row: any): LedgerAccountEntity {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type as AccountType,
      balance: parseFloat(row.balance),
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
