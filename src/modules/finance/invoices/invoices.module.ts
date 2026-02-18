import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { InvoicesController } from './api/invoices.controller';
import { InvoicesService } from './application/invoices.service';
import { InvoicesRepository } from './infrastructure/invoices.repository';
import { CreateInvoiceUseCase } from './application/usecases/create-invoice.usecase';
import { ListInvoicesUseCase } from './application/usecases/list-invoices.usecase';
import { UpdateInvoiceStatusUseCase } from './application/usecases/update-invoice-status.usecase';

@Module({
    imports: [DatabaseModule],
    controllers: [InvoicesController],
    providers: [
        InvoicesService,
        InvoicesRepository,
        CreateInvoiceUseCase,
        ListInvoicesUseCase,
        UpdateInvoiceStatusUseCase,
    ],
    exports: [
        InvoicesService,
        InvoicesRepository,
        CreateInvoiceUseCase,
        ListInvoicesUseCase,
        UpdateInvoiceStatusUseCase,
    ],
})
export class InvoicesModule { }
