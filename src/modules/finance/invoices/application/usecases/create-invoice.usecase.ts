import { Injectable, Logger } from '@nestjs/common';
import { DatabasePool } from '../../../../../database/pool';
import { InvoicesRepository } from '../../infrastructure/invoices.repository';
import { CreateInvoiceDto } from '../../api/dto/create-invoice.dto';
import { InvoiceStatus } from '../../domain/invoice.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../../shared/events/event.constants';

@Injectable()
export class CreateInvoiceUseCase {
  private readonly logger = new Logger(CreateInvoiceUseCase.name);

  constructor(
    private readonly invoicesRepo: InvoicesRepository,
    private readonly dbPool: DatabasePool,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateInvoiceDto, createdByUserId: string) {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Generate Sequential Invoice Number with Lock
      const invoiceNumber = await this.generateSequentialInvoiceNumber(client);

      // 2. Calculate Totals
      let subtotal = 0;
      dto.items.forEach((item) => {
        subtotal += item.quantity * item.unitPrice;
      });

      const taxRate = dto.taxRate || 20;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      // 3. Prepare Data
      const invoiceData = {
        invoiceNumber,
        clientId: dto.clientId,
        projectId: dto.projectId,
        status: InvoiceStatus.DRAFT, // Default to DRAFT
        subtotal,
        taxRate,
        taxAmount,
        total,
        issueDate: new Date(dto.issueDate || Date.now()),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
        createdBy: createdByUserId,
      };

      // 4. Save to DB
      const invoice = await this.invoicesRepo.create(
        invoiceData,
        dto.items,
        client,
      );

      await client.query('COMMIT');

      this.logger.log(`Invoice created: ${invoice.invoiceNumber}`);

      this.eventEmitter.emit(SystemEvents.INVOICE_CREATED, {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        createdBy: invoice.createdBy,
        clientId: invoice.clientId,
      });

      return invoice;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Failed to create invoice', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate sequential invoice number with format: INV-YYYY-NNNNN
   * Uses database row-level lock to prevent concurrent duplicates
   *
   * Example: INV-2026-00001, INV-2026-00002, etc.
   */
  private async generateSequentialInvoiceNumber(client: any): Promise<string> {
    const year = new Date().getFullYear();

    // Get the last invoice number for current year with row-level lock
    const result = await client.query(
      `
      SELECT invoice_number
      FROM invoices
      WHERE invoice_number LIKE $1
      ORDER BY invoice_number DESC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
      `,
      [`INV-${year}-%`],
    );

    let sequenceNumber = 1;

    if (result.rows.length > 0) {
      const lastInvoiceNumber = result.rows[0].invoice_number;
      // Extract sequence from INV-2026-00001 -> 00001
      const match = lastInvoiceNumber.match(/INV-\d{4}-(\d{5})/);
      if (match) {
        sequenceNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Format: INV-2026-00001
    const paddedSequence = sequenceNumber.toString().padStart(5, '0');
    return `INV-${year}-${paddedSequence}`;
  }
}
