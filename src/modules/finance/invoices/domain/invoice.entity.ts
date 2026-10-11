export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export interface InvoiceItemEntity {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceEntity {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId?: string;
  status: InvoiceStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  issueDate: Date;
  dueDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // joined
  clientName?: string;
  projectName?: string;
  items?: InvoiceItemEntity[];
}

export class Invoice {
  static fromRow(row: any): InvoiceEntity {
    const subtotalRaw = row.subtotal ?? row.total_amount ?? 0;
    const taxRateRaw = row.tax_rate ?? 0;
    const taxAmountRaw = row.tax_amount ?? 0;
    const totalRaw = row.total ?? row.total_amount ?? 0;
    const issueDateRaw = row.issue_date ?? row.created_at ?? new Date();
    const dueDateRaw = row.due_date ?? undefined;
    const createdAtRaw = row.created_at ?? new Date();
    const updatedAtRaw = row.updated_at ?? createdAtRaw;

    return {
      id: row.id,
      invoiceNumber: row.invoice_number ?? row.id,
      clientId: row.client_id,
      projectId: row.project_id,
      status: row.status as InvoiceStatus,
      subtotal: parseFloat(String(subtotalRaw || 0)),
      taxRate: parseFloat(String(taxRateRaw || 0)),
      taxAmount: parseFloat(String(taxAmountRaw || 0)),
      total: parseFloat(String(totalRaw || 0)),
      issueDate: issueDateRaw,
      dueDate: dueDateRaw,
      notes: row.notes,
      createdBy: row.created_by ?? '',
      createdAt: createdAtRaw,
      updatedAt: updatedAtRaw,
      clientName: row.client_name,
      projectName: row.project_name,
      items: [], // Populated separately if needed
    };
  }

  static itemFromRow(row: any): InvoiceItemEntity {
    const amountRaw = row.total ?? row.amount ?? 0;
    return {
      id: row.id,
      invoiceId: row.invoice_id,
      description: row.description,
      quantity: parseFloat(String(row.quantity ?? 1)),
      unitPrice: parseFloat(String(row.unit_price ?? amountRaw)),
      total: parseFloat(String(amountRaw)),
    };
  }
}
