import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { LedgerService } from './application/ledger.service';
import { LedgerRepository } from './infrastructure/ledger.repository';

@Module({
    imports: [DatabaseModule],
    providers: [LedgerService, LedgerRepository],
    exports: [LedgerService], // Exported for use in Invoices/Payments
})
export class LedgerModule { }
