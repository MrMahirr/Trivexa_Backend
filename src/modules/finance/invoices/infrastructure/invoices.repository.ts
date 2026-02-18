import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import { CreateInvoiceDto } from '../api/dto/create-invoice.dto';
import { InvoiceQueryDto } from '../api/dto/invoice-query.dto';
import { Invoice, InvoiceEntity, InvoiceItemEntity } from '../domain/invoice.entity';

@Injectable()
export class InvoicesRepository {
    constructor(private readonly db: DatabasePool) { }

    async create(
        invoiceData: Partial<InvoiceEntity>,
        items: any[],
        client: PoolClient,
    ): Promise<InvoiceEntity> {
        // 1. Insert Invoice
        const invoiceSql = `
            INSERT INTO invoices (
                invoice_number, client_id, project_id, status, subtotal, tax_rate, tax_amount, total, 
                issue_date, due_date, notes, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `;
        const invoiceParams = [
            invoiceData.invoiceNumber,
            invoiceData.clientId,
            invoiceData.projectId,
            invoiceData.status,
            invoiceData.subtotal,
            invoiceData.taxRate,
            invoiceData.taxAmount,
            invoiceData.total,
            invoiceData.issueDate,
            invoiceData.dueDate,
            invoiceData.notes,
            invoiceData.createdBy,
        ];
        const invoiceRow = await BaseQuery.queryOne<any>(client, invoiceSql, invoiceParams);
        const invoice = Invoice.fromRow(invoiceRow);

        // 2. Insert Items
        if (items.length > 0) {
            const itemSql = `
                INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;
            const createdItems: InvoiceItemEntity[] = [];
            for (const item of items) {
                const itemRow = await BaseQuery.queryOne<any>(client, itemSql, [
                    invoice.id,
                    item.description,
                    item.quantity,
                    item.unitPrice,
                    item.quantity * item.unitPrice,
                ]);
                createdItems.push(Invoice.itemFromRow(itemRow));
            }
            invoice.items = createdItems;
        }

        return invoice;
    }

    async findAll(query: InvoiceQueryDto): Promise<InvoiceEntity[]> {
        const client = await this.db.getPool().connect();
        try {
            let sql = `
                SELECT i.*, 
                       c.company_name as client_name,
                       p.name as project_name
                FROM invoices i
                LEFT JOIN clients c ON i.client_id = c.id
                LEFT JOIN projects p ON i.project_id = p.id
                WHERE 1=1
            `;
            const params: any[] = [];
            let pIdx = 1;

            if (query.status) {
                sql += ` AND i.status = $${pIdx++}`;
                params.push(query.status);
            }
            if (query.clientId) {
                sql += ` AND i.client_id = $${pIdx++}`;
                params.push(query.clientId);
            }
            // Pagination
            const limit = query.limit || 10;
            const offset = ((query.page || 1) - 1) * limit;
            sql += ` ORDER BY i.created_at DESC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
            params.push(limit, offset);

            const rows = await BaseQuery.queryMany<any>(client, sql, params);
            return rows.map(Invoice.fromRow);
        } finally {
            client.release();
        }
    }

    async findById(id: string): Promise<InvoiceEntity | null> {
        const client = await this.db.getPool().connect();
        try {
            const sql = `
                SELECT i.*, 
                       c.company_name as client_name,
                       p.name as project_name
                FROM invoices i
                LEFT JOIN clients c ON i.client_id = c.id
                LEFT JOIN projects p ON i.project_id = p.id
                WHERE i.id = $1
            `;
            const row = await BaseQuery.queryOne<any>(client, sql, [id]);
            if (!row) return null;

            const invoice = Invoice.fromRow(row);

            // Fetch items
            const itemsSql = `SELECT * FROM invoice_items WHERE invoice_id = $1`;
            const itemRows = await BaseQuery.queryMany<any>(client, itemsSql, [id]);
            invoice.items = itemRows.map(Invoice.itemFromRow);

            return invoice;
        } finally {
            client.release();
        }
    }

    async updateStatus(id: string, status: string, client?: PoolClient): Promise<InvoiceEntity | null> {
        const dbClient = client || await this.db.getPool().connect();
        const shouldRelease = !client;

        try {
            const sql = `UPDATE invoices SET status = $1 WHERE id = $2 RETURNING *`;
            const row = await BaseQuery.queryOne<any>(dbClient, sql, [status, id]);
            return row ? Invoice.fromRow(row) : null;
        } finally {
            if (shouldRelease) (dbClient as PoolClient).release();
        }
    }

    async countInvoicesByYear(year: number): Promise<number> {
        const client = await this.db.getPool().connect();
        try {
            const sql = `SELECT count(*) as count FROM invoices WHERE EXTRACT(YEAR FROM created_at) = $1`;
            const row = await BaseQuery.queryOne<any>(client, sql, [year]);
            return parseInt(row.count, 10);
        } finally {
            client.release();
        }
    }

    async sumByDateRange(startDate: Date, endDate: Date): Promise<{ totalIssued: number, totalCollected: number }> {
        const client = await this.db.getPool().connect();
        try {
            // Calculate total issued (sum of all invoices in range)
            // and total collected (sum of invoices with status PAID, or we could look at payments table but simpler for now)
            // Actually, querying payments table is more accurate for "collected", but let's stick to invoice totals for "Billed Revenue"

            const sql = `
                SELECT 
                    COALESCE(SUM(total), 0) as total_issued,
                    COALESCE(SUM(CASE WHEN status = 'PAID' THEN total 
                                      WHEN status = 'PARTIALLY_PAID' THEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = invoices.id)
                                      ELSE 0 END), 0) as total_collected
                FROM invoices 
                WHERE issue_date >= $1 AND issue_date <= $2
            `;
            const row = await BaseQuery.queryOne<any>(client, sql, [startDate, endDate]);
            return {
                totalIssued: parseFloat(row.total_issued),
                totalCollected: parseFloat(row.total_collected),
            };
        } finally {
            client.release();
        }
    }
}
