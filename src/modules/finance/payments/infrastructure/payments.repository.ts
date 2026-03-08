import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import {
  Payment,
  PaymentAuditEntity,
  PaymentAuditFilters,
  PaymentAuditPage,
  PaymentEntity,
} from '../domain/payment.entity';

interface PaymentsSchemaSnapshot {
  hasPaymentDate: boolean;
  hasReference: boolean;
  hasNotes: boolean;
  hasReceiptUrl: boolean;
  hasRecordedBy: boolean;
  hasCreatedAt: boolean;
}

@Injectable()
export class PaymentsRepository {
  private paymentsSchemaCache: PaymentsSchemaSnapshot | null = null;

  constructor(private readonly db: DatabasePool) {}

  async create(
    paymentData: Partial<PaymentEntity>,
    client: PoolClient,
  ): Promise<PaymentEntity> {
    const schema = await this.getPaymentsSchema(client);

    const columns = ['invoice_id', 'amount', 'method'];
    const values: any[] = [
      paymentData.invoiceId,
      paymentData.amount,
      paymentData.method,
    ];

    if (schema.hasPaymentDate) {
      columns.push('payment_date');
      values.push(paymentData.paymentDate ?? new Date());
    }
    if (schema.hasReference) {
      columns.push('reference');
      values.push(paymentData.reference ?? null);
    }
    if (schema.hasNotes) {
      columns.push('notes');
      values.push(paymentData.notes ?? null);
    }
    if (schema.hasReceiptUrl) {
      columns.push('receipt_url');
      values.push(paymentData.receiptUrl ?? null);
    }
    if (schema.hasRecordedBy) {
      columns.push('recorded_by');
      values.push(paymentData.recordedBy ?? null);
    }
    if (schema.hasCreatedAt) {
      columns.push('created_at');
    }

    const placeholders = values.map((_, index) => `$${index + 1}`);
    if (schema.hasCreatedAt) {
      placeholders.push('NOW()');
    }

    const row = await BaseQuery.queryOne<any>(
      client,
      `
        INSERT INTO payments (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *;
      `,
      values,
    );

    return Payment.fromRow(row);
  }

  async findById(
    id: string,
    client?: PoolClient,
  ): Promise<PaymentEntity | null> {
    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      const schema = await this.getPaymentsSchema(dbClient);
      const sql = schema.hasRecordedBy
        ? `
            SELECT
              p.*,
              COALESCE(
                NULLIF(TRIM(CONCAT_WS(' ', u.first_name, u.last_name)), ''),
                u.email,
                'Sistem'
              ) AS recorded_by_name
            FROM payments p
            LEFT JOIN users u ON u.id = p.recorded_by
            WHERE p.id = $1
          `
        : `
            SELECT p.*
            FROM payments p
            WHERE p.id = $1
          `;
      const row = await BaseQuery.queryOne<any>(dbClient, sql, [id]);
      return row ? Payment.fromRow(row) : null;
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async findByInvoiceId(invoiceId: string): Promise<PaymentEntity[]> {
    const client = await this.db.getPool().connect();
    try {
      const schema = await this.getPaymentsSchema(client);
      const orderBy = schema.hasPaymentDate
        ? 'payment_date DESC'
        : schema.hasCreatedAt
          ? 'created_at DESC'
          : 'id DESC';

      const sql = schema.hasRecordedBy
        ? `
            SELECT
              p.*,
              COALESCE(
                NULLIF(TRIM(CONCAT_WS(' ', u.first_name, u.last_name)), ''),
                u.email,
                'Sistem'
              ) AS recorded_by_name
            FROM payments p
            LEFT JOIN users u ON u.id = p.recorded_by
            WHERE p.invoice_id = $1
            ORDER BY p.${orderBy}
          `
        : `
            SELECT p.*
            FROM payments p
            WHERE p.invoice_id = $1
            ORDER BY p.${orderBy}
          `;
      const rows = await BaseQuery.queryMany<any>(client, sql, [invoiceId]);
      return rows.map((row) => Payment.fromRow(row));
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    paymentData: Partial<PaymentEntity>,
    client?: PoolClient,
  ): Promise<PaymentEntity | null> {
    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      const schema = await this.getPaymentsSchema(dbClient);
      const sets: string[] = [];
      const values: any[] = [];

      if (paymentData.amount !== undefined) {
        sets.push(`amount = $${values.length + 1}`);
        values.push(paymentData.amount);
      }
      if (paymentData.method !== undefined) {
        sets.push(`method = $${values.length + 1}`);
        values.push(paymentData.method);
      }
      if (paymentData.paymentDate !== undefined && schema.hasPaymentDate) {
        sets.push(`payment_date = $${values.length + 1}`);
        values.push(paymentData.paymentDate);
      }
      if (paymentData.reference !== undefined && schema.hasReference) {
        sets.push(`reference = $${values.length + 1}`);
        values.push(paymentData.reference ?? null);
      }
      if (paymentData.notes !== undefined && schema.hasNotes) {
        sets.push(`notes = $${values.length + 1}`);
        values.push(paymentData.notes ?? null);
      }
      if (paymentData.receiptUrl !== undefined && schema.hasReceiptUrl) {
        sets.push(`receipt_url = $${values.length + 1}`);
        values.push(paymentData.receiptUrl ?? null);
      }

      if (sets.length === 0) {
        return this.findById(id, dbClient);
      }

      values.push(id);
      const row = await BaseQuery.queryOne<any>(
        dbClient,
        `
          UPDATE payments
          SET ${sets.join(', ')}
          WHERE id = $${values.length}
          RETURNING *;
        `,
        values,
      );

      if (!row) return null;
      return this.findById(row.id, dbClient);
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async remove(
    id: string,
    client?: PoolClient,
  ): Promise<boolean> {
    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      const affected = await BaseQuery.execute(
        dbClient,
        `DELETE FROM payments WHERE id = $1`,
        [id],
      );
      return affected > 0;
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async sumPaymentsByInvoiceId(
    invoiceId: string,
    client?: PoolClient,
  ): Promise<number> {
    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      const sql = `SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE invoice_id = $1`;
      const row = await BaseQuery.queryOne<any>(dbClient, sql, [invoiceId]);
      return parseFloat(row.total_paid);
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async findAuditByInvoiceId(
    invoiceId: string,
    filters?: PaymentAuditFilters,
    client?: PoolClient,
  ): Promise<PaymentAuditPage> {
    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      const conditions: string[] = [
        `UPPER(al.resource) = 'PAYMENT'`,
        `(al.new_data ->> 'invoiceId') = $1`,
      ];
      const params: any[] = [invoiceId];
      let nextParam = 2;

      if (filters?.eventType) {
        conditions.push(
          `COALESCE(
              NULLIF(UPPER(al.new_data ->> 'eventType'), ''),
              CASE UPPER(al.action)
                WHEN 'CREATE' THEN 'PAYMENT_CREATED'
                WHEN 'UPDATE' THEN 'PAYMENT_UPDATED'
                WHEN 'DELETE' THEN 'PAYMENT_DELETED'
                ELSE 'OTHER'
              END
            ) = $${nextParam++}`,
        );
        params.push(filters.eventType.toUpperCase());
      }

      if (filters?.startDate) {
        conditions.push(`al.created_at >= $${nextParam++}::date`);
        params.push(filters.startDate);
      }

      if (filters?.endDate) {
        conditions.push(
          `al.created_at < ($${nextParam++}::date + INTERVAL '1 day')`,
        );
        params.push(filters.endDate);
      }

      if (filters?.userId) {
        conditions.push(`al.user_id = $${nextParam++}`);
        params.push(filters.userId);
      }

      const page = filters?.page && filters.page > 0 ? filters.page : 1;
      const limit = filters?.limit && filters.limit > 0 ? filters.limit : 20;
      const offset = (page - 1) * limit;
      const sortDirection = filters?.sortDirection === 'ASC' ? 'ASC' : 'DESC';

      const countRow = await BaseQuery.queryOne<{ total: string }>(
        dbClient,
        `
          SELECT COUNT(*)::text AS total
          FROM audit_logs al
          WHERE ${conditions.join(' AND ')}
        `,
        params,
      );
      const total = Number(countRow?.total || 0);

      const resultParams = [...params, limit, offset];

      const rows = await BaseQuery.queryMany<any>(
        dbClient,
        `
          SELECT
            al.id,
            al.resource_id AS payment_id,
            al.action,
            al.user_id,
            COALESCE(
              NULLIF(TRIM(CONCAT_WS(' ', u.first_name, u.last_name)), ''),
              u.email,
              'Sistem'
            ) AS user_name,
            al.new_data AS details,
            al.created_at
          FROM audit_logs al
          LEFT JOIN users u ON u.id = al.user_id
          WHERE ${conditions.join(' AND ')}
          ORDER BY al.created_at ${sortDirection}
          LIMIT $${nextParam++}
          OFFSET $${nextParam++}
        `,
        resultParams,
      );

      const data = rows.map((row) => {
        let details: Record<string, any> | undefined;
        if (typeof row.details === 'string') {
          try {
            details = JSON.parse(row.details);
          } catch {
            details = undefined;
          }
        } else {
          details = row.details || undefined;
        }

        return {
          id: row.id,
          paymentId: row.payment_id ?? undefined,
          invoiceId: details?.invoiceId ?? undefined,
          action: row.action,
          userId: row.user_id ?? undefined,
          userName: row.user_name ?? undefined,
          details,
          createdAt: row.created_at ?? new Date(),
        } as PaymentAuditEntity;
      });

      return {
        data,
        total,
        page,
        limit,
      };
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async findUserIdsByRoles(
    roles: string[],
    client?: PoolClient,
  ): Promise<string[]> {
    if (!roles.length) return [];
    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      const rows = await BaseQuery.queryMany<{ id: string }>(
        dbClient,
        `
          SELECT id
          FROM users
          WHERE role = ANY($1::text[])
            AND is_active = true
        `,
        [roles],
      );
      return rows.map((row) => row.id);
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  async findUserDisplayNameById(
    userId: string,
    client?: PoolClient,
  ): Promise<string | null> {
    const dbClient = client || (await this.db.getPool().connect());
    const shouldRelease = !client;
    try {
      const row = await BaseQuery.queryOne<{ name: string }>(
        dbClient,
        `
          SELECT
            COALESCE(
              NULLIF(TRIM(CONCAT_WS(' ', first_name, last_name)), ''),
              email
            ) AS name
          FROM users
          WHERE id = $1
        `,
        [userId],
      );
      return row?.name ?? null;
    } finally {
      if (shouldRelease) dbClient.release();
    }
  }

  private async getPaymentsSchema(
    client: PoolClient,
  ): Promise<PaymentsSchemaSnapshot> {
    if (this.paymentsSchemaCache) {
      return this.paymentsSchemaCache;
    }

    try {
      const rows = await BaseQuery.queryMany<{ column_name: string }>(
        client,
        `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'payments'
        `,
        [],
      );
      const columns = new Set((rows || []).map((row) => row.column_name));

      this.paymentsSchemaCache = {
        hasPaymentDate: columns.has('payment_date'),
        hasReference: columns.has('reference'),
        hasNotes: columns.has('notes'),
        hasReceiptUrl: columns.has('receipt_url'),
        hasRecordedBy: columns.has('recorded_by'),
        hasCreatedAt: columns.has('created_at'),
      };
    } catch {
      // Keep current behavior in tests/runtime if schema lookup is unavailable.
      this.paymentsSchemaCache = {
        hasPaymentDate: true,
        hasReference: true,
        hasNotes: true,
        hasReceiptUrl: true,
        hasRecordedBy: true,
        hasCreatedAt: true,
      };
    }

    return this.paymentsSchemaCache;
  }
}
