import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { InvoicesController } from './api/invoices.controller';
import { InvoicesService } from './application/invoices.service';
import { InvoicesRepository } from './infrastructure/invoices.repository';

@Module({
    imports: [DatabaseModule],
    controllers: [InvoicesController],
    providers: [InvoicesService, InvoicesRepository],
    exports: [InvoicesService, InvoicesRepository],
})
export class InvoicesModule { }
