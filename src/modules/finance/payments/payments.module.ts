import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { PaymentsController } from './api/payments.controller';
import { PaymentsService } from './application/payments.service';
import { PaymentsRepository } from './infrastructure/payments.repository';
import { ProcessPaymentUseCase } from './application/usecases/process-payment.usecase';
import { ListPaymentsByInvoiceUseCase } from './application/usecases/list-payments-by-invoice.usecase';

@Module({
  imports: [DatabaseModule, InvoicesModule, ExpensesModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentsRepository,
    ProcessPaymentUseCase,
    ListPaymentsByInvoiceUseCase,
  ],
  exports: [
    PaymentsService,
    PaymentsRepository,
    ProcessPaymentUseCase,
    ListPaymentsByInvoiceUseCase,
  ],
})
export class PaymentsModule {}
