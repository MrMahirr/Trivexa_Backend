import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionManager } from '../../../../database/transaction';
import { InvoiceStatus } from '../../invoices/domain/invoice.entity';
import { InvoicesRepository } from '../../invoices/infrastructure/invoices.repository';
import { CreatePaymentDto } from '../api/dto/create-payment.dto';
import { PaymentEntity } from '../domain/payment.entity';
import { PaymentsRepository } from '../infrastructure/payments.repository';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly paymentsRepository: PaymentsRepository,
        private readonly invoicesRepository: InvoicesRepository,
        private readonly transactionManager: TransactionManager,
    ) { }

    async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<PaymentEntity> {
        return this.transactionManager.run(async (client) => {
            // 1. Validate Invoice Exists (Locking is optional, but good to check)
            const invoice = await this.invoicesRepository.findById(createPaymentDto.invoiceId);
            if (!invoice) {
                throw new NotFoundException('Invoice not found');
            }

            // 2. Create Payment
            const payment = await this.paymentsRepository.create({
                ...createPaymentDto,
                paymentDate: createPaymentDto.paymentDate ? new Date(createPaymentDto.paymentDate) : new Date(),
                recordedBy: userId,
            }, client);

            // 3. Recalculate Totals
            const totalPaid = await this.paymentsRepository.sumPaymentsByInvoiceId(createPaymentDto.invoiceId, client);

            // 4. Update Invoice Status
            let newStatus = InvoiceStatus.PARTIALLY_PAID;
            if (totalPaid >= invoice.total) {
                newStatus = InvoiceStatus.PAID;
            }

            // Only update if status changed (or force update to reflect payment?)
            // We should ensure we don't revert a CANCELLED invoice or similar unless allowed.
            // Assuming simplified logic: Payment -> Status Update.
            if (invoice.status !== InvoiceStatus.CANCELLED) {
                await this.invoicesRepository.updateStatus(invoice.id, newStatus, client);
            }

            return payment;
        });
    }

    async getPaymentsByInvoice(invoiceId: string): Promise<PaymentEntity[]> {
        return this.paymentsRepository.findByInvoiceId(invoiceId);
    }
}
