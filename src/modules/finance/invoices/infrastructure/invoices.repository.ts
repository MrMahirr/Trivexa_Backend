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

@Injectable()
export class InvoicesRepository {
  constructor(private readonly db: DatabasePool) {}

  async create(
    invoiceData: Partial<InvoiceEntity>,
    items: any[],
    client: PoolClient,
  ): Promise<InvoiceEntity> {
    // 1. Insert Invoice
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
    const invoiceRow = await BaseQuery.queryOne<any>(
      client,
      InvoicesSql.insertInvoice,
      invoiceParams,
    );
    const invoice = Invoice.fromRow(invoiceRow);

    // 2. Insert Items
    if (items.length > 0) {
      const createdItems: InvoiceItemEntity[] = [];
      for (const item of items) {
        const itemRow = await BaseQuery.queryOne<any>(
          client,
          InvoicesSql.insertInvoiceItem,
          [
            invoice.id,
            item.description,
            item.quantity,
            item.unitPrice,
            item.quantity * item.unitPrice,
          ],
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
      let sql = InvoicesSql.findAll;
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
      return rows.map((row) => Invoice.fromRow(row));
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<InvoiceEntity | null> {
    const client = await this.db.getPool().connect();
    try {
      const row = await BaseQuery.queryOne<any>(client, InvoicesSql.findById, [
        id,
      ]);
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
      const row = await BaseQuery.queryOne<any>(
        client,
        InvoicesSql.sumByDateRange,
        [startDate, endDate],
      );
      return {
        totalIssued: parseFloat(row.total_issued),
        totalCollected: parseFloat(row.total_collected),
      };
    } finally {
      client.release();
    }
  }
}
