import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import { CreateExpenseDto } from '../api/dto/create-expense.dto';
import { Expense, ExpenseEntity, ExpenseStatus } from '../domain/expense.entity';

@Injectable()
export class ExpensesRepository {
    constructor(private readonly db: DatabasePool) { }

    async create(expenseData: Partial<ExpenseEntity>, client: PoolClient): Promise<ExpenseEntity> {
        const sql = `
            INSERT INTO expenses (
                description, amount, expense_date, category, status, department, 
                requested_by, receipt_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const params = [
            expenseData.description,
            expenseData.amount,
            expenseData.expenseDate,
            expenseData.category,
            ExpenseStatus.PENDING, // Default status
            expenseData.department,
            expenseData.requestedBy,
            expenseData.receiptUrl,
        ];
        const row = await BaseQuery.queryOne<any>(client, sql, params);
        return Expense.fromRow(row);
    }

    async findAll(limit: number = 20, offset: number = 0): Promise<ExpenseEntity[]> {
        const client = await this.db.getPool().connect();
        try {
            const sql = `
                SELECT e.*, 
                       u1.email as requester_name, 
                       u2.email as approver_name 
                FROM expenses e
                LEFT JOIN users u1 ON e.requested_by = u1.id
                LEFT JOIN users u2 ON e.approved_by = u2.id
                ORDER BY e.created_at DESC
                LIMIT $1 OFFSET $2
            `;
            const rows = await BaseQuery.queryMany<any>(client, sql, [limit, offset]);
            return rows.map(Expense.fromRow);
        } finally {
            client.release();
        }
    }

    async findById(id: string): Promise<ExpenseEntity | null> {
        const client = await this.db.getPool().connect();
        try {
            const sql = `
                SELECT e.*, 
                       u1.email as requester_name, 
                       u2.email as approver_name 
                FROM expenses e
                LEFT JOIN users u1 ON e.requested_by = u1.id
                LEFT JOIN users u2 ON e.approved_by = u2.id
                WHERE e.id = $1
            `;
            const row = await BaseQuery.queryOne<any>(client, sql, [id]);
            return row ? Expense.fromRow(row) : null;
        } finally {
            client.release();
        }
    }

    async updateStatus(id: string, status: ExpenseStatus, approvedBy: string, client?: PoolClient): Promise<ExpenseEntity> {
        const dbClient = client || await this.db.getPool().connect();
        const shouldRelease = !client;
        try {
            const sql = `
                UPDATE expenses 
                SET status = $2, approved_by = $3, updated_at = NOW()
                WHERE id = $1
                RETURNING *;
            `;
            const row = await BaseQuery.queryOne<any>(dbClient, sql, [id, status, approvedBy]);
            return Expense.fromRow(row);
        } finally {
            if (shouldRelease) (dbClient as PoolClient).release();
        }
    }
}
