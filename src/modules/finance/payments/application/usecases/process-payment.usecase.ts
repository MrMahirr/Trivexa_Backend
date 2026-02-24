import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabasePool } from '../../../../../database/pool';
import { PaymentsRepository } from '../../infrastructure/payments.repository';
import { InvoicesRepository } from '../../../invoices/infrastructure/invoices.repository';
import { CreatePaymentDto } from '../../api/dto/create-payment.dto';
import { InvoiceStatus } from '../../../invoices/domain/invoice.entity';
import { InvoiceNotFoundException } from '../../../invoices/domain/invoice.errors';

@Injectable()
export class ProcessPaymentUseCase {
  private readonly logger = new Logger(ProcessPaymentUseCase.name);

  constructor(
    private readonly paymentsRepo: PaymentsRepository,
    private readonly invoicesRepo: InvoicesRepository,
    private readonly dbPool: DatabasePool,
  ) { }

  async execute(dto: CreatePaymentDto, recordedByUserId: string) {
    const pool = this.dbPool.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Check Invoice Exists
      const invoice = await this.invoicesRepo.findById(dto.invoiceId);
      if (!invoice) {
        throw new InvoiceNotFoundException(dto.invoiceId);
      }

      // 2. Create Payment
      const paymentData = {
        ...dto,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        recordedBy: recordedByUserId,
      };

      const payment = await this.paymentsRepo.create(paymentData, client);

      // 3. Calculate Total Paid
      // Note: paymentsRepo.sumPaymentsByInvoiceId might not include the current transaction's payment
      // if isolation level is read committed and it reads from snapshot,
      // BUT since we are in the SAME transaction / client, it SHOULD see it.
      // However, just to be safe, let's verify logic.
      // Actually, querying SUM from DB is safer.
      const totalPaid = await this.paymentsRepo.sumPaymentsByInvoiceId(
        dto.invoiceId,
        client,
      );

      // 4. Update Invoice Status
      let newStatus = invoice.status;
      if (totalPaid >= invoice.total) {
        newStatus = InvoiceStatus.PAID;
      } else if (totalPaid > 0) {
        newStatus = InvoiceStatus.PARTIALLY_PAID;
      } else {
        // Should technically not happen if we just added a payment > 0
        newStatus = InvoiceStatus.SENT;
      }

      // Only update if status changed
      if (newStatus !== invoice.status) {
        await this.invoicesRepo.updateStatus(dto.invoiceId, newStatus, client);
        this.logger.log(
          `Invoice ${invoice.invoiceNumber} status updated to ${newStatus}`,
        );
      }

      await client.query('COMMIT');

      this.logger.log(
        `Payment processed: ${payment.id} for Invoice ${invoice.invoiceNumber}`,
      );
      return payment;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Failed to process payment', error);
      throw error;
    } finally {
      client.release();
    }
  }
}
