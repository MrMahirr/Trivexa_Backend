import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import { AccountCode, AccountType, LedgerAccount, LedgerAccountEntity } from '../domain/ledger-account.entity';
import { EntryType, LedgerEntry, LedgerEntryEntity } from '../domain/ledger-entry.entity';

@Injectable()
export class LedgerRepository {
    constructor(private readonly db: DatabasePool) { }

    async createAccount(data: { code: string; name: string; type: AccountType; description?: string }, client?: PoolClient): Promise<LedgerAccountEntity> {
        const dbClient = client || await this.db.getPool().connect();
        const shouldRelease = !client;
        try {
            const sql = `
                INSERT INTO ledger_accounts (code, name, type, description)
                VALUES ($1, $2, $3, $4)
                RETURNING *;
            `;
            const params = [data.code, data.name, data.type, data.description];
            const row = await BaseQuery.queryOne<any>(dbClient, sql, params);
            return LedgerAccount.fromRow(row);
        } finally {
            if (shouldRelease) (dbClient as PoolClient).release();
        }
    }

    async findAccountByCode(code: string, client?: PoolClient): Promise<LedgerAccountEntity | null> {
        const dbClient = client || await this.db.getPool().connect();
        const shouldRelease = !client;
        try {
            const sql = `SELECT * FROM ledger_accounts WHERE code = $1`;
            const row = await BaseQuery.queryOne<any>(dbClient, sql, [code]);
            return row ? LedgerAccount.fromRow(row) : null;
        } finally {
            if (shouldRelease) (dbClient as PoolClient).release();
        }
    }

    async createEntry(data: {
        transactionId: string;
        accountId: string;
        amount: number;
        type: EntryType;
        description: string;
        referenceType?: string;
        referenceId?: string;
    }, client: PoolClient): Promise<LedgerEntryEntity> {
        const sql = `
            INSERT INTO ledger_entries (
                transaction_id, account_id, amount, type, description, 
                reference_type, reference_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const params = [
            data.transactionId,
            data.accountId,
            data.amount,
            data.type,
            data.description,
            data.referenceType,
            data.referenceId,
        ];
        const row = await BaseQuery.queryOne<any>(client, sql, params);

        // Update Account Balance
        // For Assets/Expenses: Debit increases (+), Credit decreases (-)
        // For Liab/Equity/Revenue: Credit increases (+), Debit decreases (-)
        // But simply: Standard balance handling often updates 'balance' column based on normal balance.
        // Or simpler: Just store balance as net value.
        // Let's assume balance is stored as signed value? 
        // Or we calculate it on fly.
        // The schema has 'balance' column. I should update it.

        // Determine sign based on Account Type and Entry Type
        // This logic fits better in Service, but atomic update in Repo is good.
        // I will just fetch account type to decide sign? Or pass it?
        // For now, I will NOT update balance here to keep it simple. 
        // Balance can be aggregated from entries or updated by trigger or service.
        // Given complexity, I'll count on Service handling connection or triggers.
        // Actually, let's implement updateBalance in Service calling a Repo method.

        return LedgerEntry.fromRow(row);
    }

    // Helper to update account balance atomically
    async updateAccountBalance(accountId: string, amountDelta: number, client: PoolClient): Promise<void> {
        const sql = `
            UPDATE ledger_accounts 
            SET balance = balance + $2, updated_at = NOW()
            WHERE id = $1
        `;
        await BaseQuery.execute(client, sql, [accountId, amountDelta]);
    }
}
