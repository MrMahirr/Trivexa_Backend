import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import {
  Expense,
  ExpenseEntity,
  ExpenseStatus,
} from '../domain/expense.entity';

@Injectable()
export class ExpensesRepository {
  private schemaEnsured = false;

  constructor(private readonly db: DatabasePool) {}

  private async ensureSchema(client: PoolClient): Promise<void> {
    if (this.schemaEnsured) {
      return;
    }

    // Legacy installs may still have a minimal expenses table. Align it with
    // the finance module expectations to avoid runtime 500 errors.
    await BaseQuery.execute(
      client,
      `
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_date DATE NOT NULL DEFAULT CURRENT_DATE;
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'OTHER';
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PENDING';
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS department TEXT NOT NULL DEFAULT 'GENERAL';
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS requested_by UUID;
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approved_by UUID;
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
      `,
    );

    this.schemaEnsured = true;
  }

  async create(
    expenseData: Partial<ExpenseEntity>,
    client: PoolClient,
  ): Promise<ExpenseEntity> {
    await this.ensureSchema(client);

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

  async findAll(
    limit: number = 20,
    offset: number = 0,
  ): Promise<ExpenseEntity[]> {
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);

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
      return rows.map((row) => Expense.fromRow(row));
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<ExpenseEntity | null> {
    const client = await this.db.getPool().connect();
    try {
      await this.ensureSchema(client);

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

  async updateStatus(
    id: string,
    status: ExpenseStatus,
    approvedBy: string,
    client?: PoolClient,
  ): Promise<ExpenseEntity> {
    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      await this.ensureSchema(dbClient);

      const sql = `
                UPDATE expenses 
                SET status = $2, approved_by = $3, updated_at = NOW()
                WHERE id = $1
                RETURNING *;
            `;
      const row = await BaseQuery.queryOne<any>(dbClient, sql, [
        id,
        status,
        approvedBy,
      ]);
      return Expense.fromRow(row);
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async updateReceipt(
    id: string,
    receiptUrl?: string,
    client?: PoolClient,
  ): Promise<ExpenseEntity | null> {
    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      await this.ensureSchema(dbClient);

      const sql = `
                UPDATE expenses
                SET receipt_url = $2, updated_at = NOW()
                WHERE id = $1
                RETURNING *;
            `;
      const row = await BaseQuery.queryOne<any>(dbClient, sql, [
        id,
        receiptUrl ?? null,
      ]);
      return row ? Expense.fromRow(row) : null;
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async sumByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<{ total: number; byCategory: Record<string, number> }> {
    const client = await this.db.getPool().connect();
    try {
      const sql = `
                SELECT 
                    COALESCE(SUM(amount), 0) as total_amount,
                    category,
                    COALESCE(SUM(amount), 0) as category_total
                FROM expenses
                WHERE expense_date >= $1 AND expense_date <= $2 AND status = 'APPROVED'
                GROUP BY category
            `;
      const rows = await BaseQuery.queryMany<any>(client, sql, [
        startDate,
        endDate,
      ]);

      const total = rows.reduce(
        (acc, row) => acc + parseFloat(row.category_total),
        0,
      );
      const byCategory: Record<string, number> = {};
      rows.forEach((row) => {
        byCategory[row.category] = parseFloat(row.category_total);
      });

      return { total, byCategory };
    } finally {
      client.release();
    }
  }
}
