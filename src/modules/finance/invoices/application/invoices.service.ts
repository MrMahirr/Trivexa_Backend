import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionManager } from '../../../../database/transaction'; // Corrected import
import { CreateInvoiceDto, CreateInvoiceItemDto } from '../api/dto/create-invoice.dto';
import { InvoiceQueryDto } from '../api/dto/invoice-query.dto';
import { UpdateInvoiceStatusDto } from '../api/dto/update-invoice-status.dto';
import { InvoiceEntity, InvoiceStatus } from '../domain/invoice.entity';
import { InvoicesRepository } from '../infrastructure/invoices.repository';

@Injectable()
export class InvoicesService {
    constructor(
        private readonly invoicesRepository: InvoicesRepository,
        private readonly transactionManager: TransactionManager,
    ) { }

    async create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<InvoiceEntity> {
        return this.transactionManager.run(async (client) => {
            // 1. Calculations
            let subtotal = 0;
            createInvoiceDto.items.forEach(item => {
                subtotal += item.quantity * item.unitPrice;
            });
            const taxRate = createInvoiceDto.taxRate || 0;
            const taxAmount = (subtotal * taxRate) / 100;
            const total = subtotal + taxAmount;

            // 2. Generate Invoice Number
            const year = new Date().getFullYear();
            const count = await this.invoicesRepository.countInvoicesByYear(year);
            const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;

            // 3. Prepare Data
            const invoiceData: Partial<InvoiceEntity> = {
                invoiceNumber,
                clientId: createInvoiceDto.clientId,
                projectId: createInvoiceDto.projectId,
                status: InvoiceStatus.DRAFT,
                subtotal,
                taxRate,
                taxAmount,
                total,
                issueDate: createInvoiceDto.issueDate ? new Date(createInvoiceDto.issueDate) : new Date(),
                dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : undefined,
                notes: createInvoiceDto.notes,
                createdBy: userId,
            };

            // 4. Save via Repository
            return this.invoicesRepository.create(invoiceData, createInvoiceDto.items, client);
        });
    }

    async findAll(query: InvoiceQueryDto): Promise<InvoiceEntity[]> {
        return this.invoicesRepository.findAll(query);
    }

    async findById(id: string): Promise<InvoiceEntity> {
        const invoice = await this.invoicesRepository.findById(id);
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        return invoice;
    }

    async updateStatus(id: string, dto: UpdateInvoiceStatusDto): Promise<InvoiceEntity> {
        const invoice = await this.findById(id);
        if (invoice.status === InvoiceStatus.PAID && dto.status !== InvoiceStatus.PAID) {
            // Business rule: Cannot unpay easily? Allow for now.
        }

        const updated = await this.invoicesRepository.updateStatus(id, dto.status);
        if (!updated) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        return updated;
    }
}
