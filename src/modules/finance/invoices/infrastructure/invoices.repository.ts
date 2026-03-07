import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import { InvoiceQueryDto } from '../api/dto/invoice-query.dto';
import {
  Invoice,
  InvoiceEntity,
  InvoiceItemEntity,
} from '../domain/invoice.entity';
import { InvoicesSql } from './sql/invoices.sql';

interface InvoiceSchemaSnapshot {
  hasInvoiceNumber: boolean;
  hasProjectId: boolean;
  hasSubtotal: boolean;
  hasIssueDate: boolean;
  hasUpdatedAt: boolean;
}

interface InvoiceItemSchemaSnapshot {
  hasQuantity: boolean;
  hasUnitPrice: boolean;
  hasTotal: boolean;
  hasAmount: boolean;
}

@Injectable()
export class InvoicesRepository {
  private invoiceSchemaCache: InvoiceSchemaSnapshot | null = null;
  private invoiceItemSchemaCache: InvoiceItemSchemaSnapshot | null = null;

  constructor(private readonly db: DatabasePool) {}

  async create(
    invoiceData: Partial<InvoiceEntity>,
    items: any[],
    client: PoolClient,
  ): Promise<InvoiceEntity> {
    const invoiceSchema = await this.getInvoiceSchema(client);
    const itemSchema = await this.getInvoiceItemSchema(client);

    const invoiceRow = invoiceSchema.hasInvoiceNumber
      ? await BaseQuery.queryOne<any>(
          client,
          InvoicesSql.insertInvoice,
          [
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
          ],
        )
      : await BaseQuery.queryOne<any>(
          client,
          `
            INSERT INTO invoices (client_id, total_amount, paid_amount, status, due_date, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *
          `,
          [
            invoiceData.clientId,
            invoiceData.total || 0,
            0,
            invoiceData.status || 'DRAFT',
            invoiceData.dueDate || null,
          ],
        );

    const invoice = Invoice.fromRow(invoiceRow);

    if (items.length > 0) {
      const createdItems: InvoiceItemEntity[] = [];
      for (const item of items) {
        const itemTotal = item.quantity * item.unitPrice;
        const itemRow =
          itemSchema.hasQuantity && itemSchema.hasUnitPrice && itemSchema.hasTotal
            ? await BaseQuery.queryOne<any>(
                client,
                InvoicesSql.insertInvoiceItem,
                [
                  invoice.id,
                  item.description,
                  item.quantity,
                  item.unitPrice,
                  itemTotal,
                ],
              )
            : await BaseQuery.queryOne<any>(
                client,
                `
                  INSERT INTO invoice_items (invoice_id, description, amount)
                  VALUES ($1, $2, $3)
                  RETURNING *
                `,
                [invoice.id, item.description, itemTotal],
              );
        createdItems.push(Invoice.itemFromRow(itemRow));
      }
      invoice.items = createdItems;
    }

    return invoice;
  }

  async findAll(query: InvoiceQueryDto): Promise<InvoiceEntity[]> {
    const client = await this.db.getPool().connect();
    try {
      const invoiceSchema = await this.getInvoiceSchema(client);
      let sql = invoiceSchema.hasProjectId
        ? InvoicesSql.findAll
        : `
            SELECT i.*,
                   c.company_name as client_name,
                   NULL::text as project_name
            FROM invoices i
            LEFT JOIN clients c ON i.client_id = c.id
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
      if (query.projectId && invoiceSchema.hasProjectId) {
        sql += ` AND i.project_id = $${pIdx++}`;
        params.push(query.projectId);
      }
      // Pagination
      const limit = query.limit || 10;
      const offset = ((query.page || 1) - 1) * limit;
      sql += ` ORDER BY i.created_at DESC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
      params.push(limit, offset);

      const rows = await BaseQuery.queryMany<any>(client, sql, params);
      return rows.map((row) => Invoice.fromRow(row));
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<InvoiceEntity | null> {
    const client = await this.db.getPool().connect();
    try {
      const invoiceSchema = await this.getInvoiceSchema(client);
      const row = invoiceSchema.hasProjectId
        ? await BaseQuery.queryOne<any>(client, InvoicesSql.findById, [id])
        : await BaseQuery.queryOne<any>(
            client,
            `
              SELECT i.*,
                     c.company_name as client_name,
                     NULL::text as project_name
              FROM invoices i
              LEFT JOIN clients c ON i.client_id = c.id
              WHERE i.id = $1
            `,
            [id],
          );
      if (!row) return null;

      const invoice = Invoice.fromRow(row);

      // Fetch items
      const itemRows = await BaseQuery.queryMany<any>(
        client,
        InvoicesSql.findItemsByInvoiceId,
        [id],
      );
      invoice.items = itemRows.map((row) => Invoice.itemFromRow(row));

      return invoice;
    } finally {
      client.release();
    }
  }

  async updateStatus(
    id: string,
    status: string,
    client?: PoolClient,
  ): Promise<InvoiceEntity | null> {
    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;

    try {
      const row = await BaseQuery.queryOne<any>(
        dbClient,
        InvoicesSql.updateStatus,
        [status, id],
      );
      return row ? Invoice.fromRow(row) : null;
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async countInvoicesByYear(year: number): Promise<number> {
    const client = await this.db.getPool().connect();
    try {
      const row = await BaseQuery.queryOne<any>(
        client,
        InvoicesSql.countByYear,
        [year],
      );
      return parseInt(row.count, 10);
    } finally {
      client.release();
    }
  }

  async sumByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<{ totalIssued: number; totalCollected: number }> {
    const client = await this.db.getPool().connect();
    try {
      const invoiceSchema = await this.getInvoiceSchema(client);
      const row = invoiceSchema.hasSubtotal
        ? await BaseQuery.queryOne<any>(client, InvoicesSql.sumByDateRange, [
            startDate,
            endDate,
          ])
        : await BaseQuery.queryOne<any>(
            client,
            `
              SELECT
                COALESCE(SUM(total_amount), 0) as total_issued,
                COALESCE(SUM(paid_amount), 0) as total_collected
              FROM invoices
              WHERE created_at >= $1 AND created_at <= $2
            `,
            [startDate, endDate],
          );
      return {
        totalIssued: parseFloat(row?.total_issued || '0'),
        totalCollected: parseFloat(row?.total_collected || '0'),
      };
    } finally {
      client.release();
    }
  }

  private async getInvoiceSchema(
    client: PoolClient,
  ): Promise<InvoiceSchemaSnapshot> {
    if (this.invoiceSchemaCache) {
      return this.invoiceSchemaCache;
    }

    try {
      const rows = await BaseQuery.queryMany<{ column_name: string }>(
        client,
        `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'invoices'
        `,
        [],
      );
      const columns = new Set((rows || []).map((row) => row.column_name));

      this.invoiceSchemaCache = {
        hasInvoiceNumber: columns.has('invoice_number'),
        hasProjectId: columns.has('project_id'),
        hasSubtotal: columns.has('subtotal'),
        hasIssueDate: columns.has('issue_date'),
        hasUpdatedAt: columns.has('updated_at'),
      };
    } catch {
      // Keep old behavior if schema inspection is not available in tests/runtime.
      this.invoiceSchemaCache = {
        hasInvoiceNumber: true,
        hasProjectId: true,
        hasSubtotal: true,
        hasIssueDate: true,
        hasUpdatedAt: true,
      };
    }

    return this.invoiceSchemaCache;
  }

  private async getInvoiceItemSchema(
    client: PoolClient,
  ): Promise<InvoiceItemSchemaSnapshot> {
    if (this.invoiceItemSchemaCache) {
      return this.invoiceItemSchemaCache;
    }

    try {
      const rows = await BaseQuery.queryMany<{ column_name: string }>(
        client,
        `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'invoice_items'
        `,
        [],
      );
      const columns = new Set((rows || []).map((row) => row.column_name));

      this.invoiceItemSchemaCache = {
        hasQuantity: columns.has('quantity'),
        hasUnitPrice: columns.has('unit_price'),
        hasTotal: columns.has('total'),
        hasAmount: columns.has('amount'),
      };
    } catch {
      this.invoiceItemSchemaCache = {
        hasQuantity: true,
        hasUnitPrice: true,
        hasTotal: true,
        hasAmount: false,
      };
    }

    return this.invoiceItemSchemaCache;
  }
}
