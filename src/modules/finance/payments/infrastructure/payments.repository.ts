import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabasePool } from '../../../../database/pool';
import { BaseQuery } from '../../../../database/query/base-query';
import { Payment, PaymentEntity } from '../domain/payment.entity';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly db: DatabasePool) {}

  async create(
    paymentData: Partial<PaymentEntity>,
    client: PoolClient,
  ): Promise<PaymentEntity> {
    const sql = `
            INSERT INTO payments (
                invoice_id, amount, payment_date, method, reference, notes, recorded_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
    const params = [
      paymentData.invoiceId,
      paymentData.amount,
      paymentData.paymentDate,
      paymentData.method,
      paymentData.reference,
      paymentData.notes,
      paymentData.recordedBy,
    ];
    const row = await BaseQuery.queryOne<any>(client, sql, params);
    return Payment.fromRow(row);
  }

  async findByInvoiceId(invoiceId: string): Promise<PaymentEntity[]> {
    const client = await this.db.getPool().connect();
    try {
      const sql = `SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC`;
      const rows = await BaseQuery.queryMany<any>(client, sql, [invoiceId]);
      return rows.map((row) => Payment.fromRow(row));
    } finally {
      client.release();
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
}
