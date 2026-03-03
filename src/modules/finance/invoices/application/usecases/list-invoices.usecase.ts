import { Injectable } from '@nestjs/common';
import { InvoicesRepository } from '../../infrastructure/invoices.repository';
import { InvoiceQueryDto } from '../../api/dto/invoice-query.dto';

@Injectable()
export class ListInvoicesUseCase {
  constructor(private readonly invoicesRepo: InvoicesRepository) {}

  async execute(query: InvoiceQueryDto) {
    return this.invoicesRepo.findAll(query);
  }
}
