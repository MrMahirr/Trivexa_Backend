import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from '../api/dto/create-invoice.dto';
import { InvoiceQueryDto } from '../api/dto/invoice-query.dto';
import { UpdateInvoiceStatusDto } from '../api/dto/update-invoice-status.dto';
import { InvoiceEntity } from '../domain/invoice.entity';
import { InvoicesRepository } from '../infrastructure/invoices.repository';
import { CreateInvoiceUseCase } from './usecases/create-invoice.usecase';
import { ListInvoicesUseCase } from './usecases/list-invoices.usecase';
import { UpdateInvoiceStatusUseCase } from './usecases/update-invoice-status.usecase';

@Injectable()
export class InvoicesService {
    constructor(
        private readonly invoicesRepository: InvoicesRepository,
        private readonly createInvoiceUseCase: CreateInvoiceUseCase,
        private readonly listInvoicesUseCase: ListInvoicesUseCase,
        private readonly updateInvoiceStatusUseCase: UpdateInvoiceStatusUseCase,
    ) { }

    async create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<InvoiceEntity> {
        return this.createInvoiceUseCase.execute(createInvoiceDto, userId);
    }

    async findAll(query: InvoiceQueryDto): Promise<InvoiceEntity[]> {
        return this.listInvoicesUseCase.execute(query);
    }

    async findById(id: string): Promise<InvoiceEntity> {
        const invoice = await this.invoicesRepository.findById(id);
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        return invoice;
    }

    async updateStatus(id: string, dto: UpdateInvoiceStatusDto): Promise<InvoiceEntity> {
        return this.updateInvoiceStatusUseCase.execute(id, dto.status);
    }
}

