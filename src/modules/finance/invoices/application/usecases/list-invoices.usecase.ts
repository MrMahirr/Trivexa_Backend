import { Injectable } from '@nestjs/common';
import { InvoicesRepository } from '../../infrastructure/invoices.repository';
import { InvoiceQueryDto } from '../../api/dto/invoice-query.dto';

@Injectable()
export class ListInvoicesUseCase {
    constructor(private readonly invoicesRepo: InvoicesRepository) { }

    async execute(query: InvoiceQueryDto) {
        const limit = query.limit || 10;
        const page = query.page || 1;

        // Repository findAll method needs to be aligned with DTO or mapped
        // InvoicesRepository.findAll accepts InvoiceQueryDto directly
        const invoices = await this.invoicesRepo.findAll(query);

        // We might want to get total count for pagination metadata
        // The repository findAll implementation currently returns InvoiceEntity[]
        // But checking the file content again...
        // Wait, checking Step 1042...
        // The repo findAll returns `InvoiceEntity[]`. It does NOT return count.
        // It DOES implement pagination in SQL but doesn't return total count.
        // BUT there is a `countInvoicesByYear`.
        // I should probably update Repository to return { data, total } or accept separate count query.

        // However, looking at Step 1042 lines 68-102:
        // it only executes SELECT query with limit/offset.
        // It does NOT execute a count query.

        // For now, I will return just the data. 
        // Ideally, I should Refactor Repository to return { data, total }.
        // Let's stick to simple implementation first to match current repository state.

        return invoices;
    }
}
