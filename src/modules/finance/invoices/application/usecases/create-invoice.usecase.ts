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

      // 1. Calculate Totals
      let subtotal = 0;
      dto.items.forEach((item) => {
        subtotal += item.quantity * item.unitPrice;
      });

      const taxRate = dto.taxRate || 20;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      // 2. Prepare Data
      const invoiceData = {
        invoiceNumber: this.generateInvoiceNumber(), // TODO: Better generation strategy
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

      // 3. Save to DB
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

  private generateInvoiceNumber(): string {
    // Simple generation: INV-TIMESTAMP-RANDOM
    // In production, this should be sequential or check for Uniqueness in DB
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `INV-${timestamp}-${random}`;
  }
}
