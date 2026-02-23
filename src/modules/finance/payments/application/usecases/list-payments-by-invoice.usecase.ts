import { Injectable } from '@nestjs/common';
import { PaymentsRepository } from '../../infrastructure/payments.repository';

@Injectable()
export class ListPaymentsByInvoiceUseCase {
  constructor(private readonly paymentsRepo: PaymentsRepository) {}

  async execute(invoiceId: string) {
    return this.paymentsRepo.findByInvoiceId(invoiceId);
  }
}
