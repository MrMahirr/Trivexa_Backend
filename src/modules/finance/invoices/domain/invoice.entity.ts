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
    return {
      id: row.id,
      invoiceNumber: row.invoice_number,
      clientId: row.client_id,
      projectId: row.project_id,
      status: row.status as InvoiceStatus,
      subtotal: parseFloat(row.subtotal),
      taxRate: parseFloat(row.tax_rate),
      taxAmount: parseFloat(row.tax_amount),
      total: parseFloat(row.total),
      issueDate: row.issue_date,
      dueDate: row.due_date,
      notes: row.notes,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      clientName: row.client_name,
      projectName: row.project_name,
      items: [], // Populated separately if needed
    };
  }

  static itemFromRow(row: any): InvoiceItemEntity {
    return {
      id: row.id,
      invoiceId: row.invoice_id,
      description: row.description,
      quantity: parseFloat(row.quantity),
      unitPrice: parseFloat(row.unit_price),
      total: parseFloat(row.total),
    };
  }
}
