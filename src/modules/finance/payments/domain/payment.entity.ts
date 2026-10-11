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
  receiptUrl?: string;
  recordedBy: string;
  recordedByName?: string;
  createdAt: Date;

  // joined
  invoiceNumber?: string;
  clientName?: string;
}

export interface PaymentAuditEntity {
  id: string;
  paymentId?: string;
  invoiceId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'OTHER';
  userId?: string;
  userName?: string;
  details?: Record<string, any>;
  createdAt: Date;
}

export interface PaymentAuditFilters {
  page?: number;
  limit?: number;
  sortDirection?: 'ASC' | 'DESC';
  eventType?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface PaymentAuditPage {
  data: PaymentAuditEntity[];
  total: number;
  page: number;
  limit: number;
}

export class Payment {
  static fromRow(row: any): PaymentEntity {
    const paymentDateRaw = row.payment_date ?? row.created_at ?? new Date();
    const createdAtRaw = row.created_at ?? row.payment_date ?? new Date();

    return {
      id: row.id,
      invoiceId: row.invoice_id,
      amount: parseFloat(row.amount),
      paymentDate: paymentDateRaw,
      method: (row.method as PaymentMethod) || PaymentMethod.OTHER,
      reference: row.reference,
      notes: row.notes,
      receiptUrl: row.receipt_url ?? row.receiptUrl ?? undefined,
      recordedBy: row.recorded_by ?? '',
      recordedByName: row.recorded_by_name ?? undefined,
      createdAt: createdAtRaw,
      invoiceNumber: row.invoice_number,
      clientName: row.client_name,
    };
  }
}
