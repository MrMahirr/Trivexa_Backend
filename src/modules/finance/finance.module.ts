import { Module } from '@nestjs/common';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { ExpensesModule } from './expenses/expenses.module';
import { LedgerModule } from './ledger/ledger.module';

@Module({
  imports: [InvoicesModule, PaymentsModule, ExpensesModule, LedgerModule],
  exports: [InvoicesModule, PaymentsModule, ExpensesModule, LedgerModule],
})
export class FinanceModule {}
