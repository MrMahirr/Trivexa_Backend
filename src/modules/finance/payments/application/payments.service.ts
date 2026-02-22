import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from '../api/dto/create-payment.dto';
import { PaymentEntity } from '../domain/payment.entity';
import { ProcessPaymentUseCase } from './usecases/process-payment.usecase';
import { ListPaymentsByInvoiceUseCase } from './usecases/list-payments-by-invoice.usecase';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly processPaymentUseCase: ProcessPaymentUseCase,
        private readonly listPaymentsByInvoiceUseCase: ListPaymentsByInvoiceUseCase,
    ) { }

    async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<PaymentEntity> {
        return this.processPaymentUseCase.execute(createPaymentDto, userId);
    }

    async getPaymentsByInvoice(invoiceId: string): Promise<PaymentEntity[]> {
        return this.listPaymentsByInvoiceUseCase.execute(invoiceId);
    }
}

