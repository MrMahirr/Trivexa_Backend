import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoicesRepository } from '../../infrastructure/invoices.repository';

@Injectable()
export class UpdateInvoiceStatusUseCase {
    constructor(private readonly invoicesRepo: InvoicesRepository) { }

    async execute(id: string, status: string) {
        const invoice = await this.invoicesRepo.updateStatus(id, status);
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        return invoice;
    }
}
