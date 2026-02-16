import { Module } from '@nestjs/common';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
    imports: [InvoicesModule],
    exports: [InvoicesModule],
})
export class FinanceModule { }
