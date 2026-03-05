import { Injectable } from '@nestjs/common';
import { InvoicesRepository } from '../../infrastructure/invoices.repository';
import { InvoiceNotFoundException } from '../../domain/invoice.errors';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SystemEvents } from '../../../../../shared/events/event.constants';

@Injectable()
export class UpdateInvoiceStatusUseCase {
  constructor(
    private readonly invoicesRepo: InvoicesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, status: string) {
    const invoice = await this.invoicesRepo.updateStatus(id, status);
    if (!invoice) {
      throw new InvoiceNotFoundException(id);
    }

    this.eventEmitter.emit(SystemEvents.INVOICE_STATUS_UPDATED, {
      invoiceId: invoice.id,
      status: invoice.status,
      createdBy: invoice.createdBy,
    });

    return invoice;
  }
}
