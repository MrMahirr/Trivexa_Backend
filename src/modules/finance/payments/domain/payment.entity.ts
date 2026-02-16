import { InvoiceEntity } from '../../invoices/domain/invoice.entity';

export enum PaymentMethod {
    BANK_TRANSFER = 'BANK_TRANSFER',
    CREDIT_CARD = 'CREDIT_CARD',
    CASH = 'CASH',
    OTHER = 'OTHER',
}

export interface PaymentEntity {
    id: string;
    invoiceId: string;
    amount: number;
    paymentDate: Date;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
    recordedBy: string;
    createdAt: Date;

    // joined
    invoiceNumber?: string;
    clientName?: string;
}

export class Payment {
    static fromRow(row: any): PaymentEntity {
        return {
            id: row.id,
            invoiceId: row.invoice_id,
            amount: parseFloat(row.amount),
            paymentDate: row.payment_date,
            method: row.method as PaymentMethod,
            reference: row.reference,
            notes: row.notes,
            recordedBy: row.recorded_by,
            createdAt: row.created_at,
            invoiceNumber: row.invoice_number,
            clientName: row.client_name,
        };
    }
}
