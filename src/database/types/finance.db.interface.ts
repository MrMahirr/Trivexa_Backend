import { BaseDbEntity } from './base.interface';

export interface InvoiceDb extends BaseDbEntity {
  invoice_number: string;
  client_id?: string;
  project_id?: string;
  status: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  issue_date: Date;
  due_date?: Date;
  notes?: string;
  created_by?: string;
}

export interface InvoiceItemDb extends BaseDbEntity {
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface PaymentDb extends BaseDbEntity {
  invoice_id?: string;
  amount: number;
  payment_date: Date;
  method: string;
  reference?: string;
  notes?: string;
  recorded_by?: string;
}

export interface ExpenseDb extends BaseDbEntity {
  description: string;
  amount: number;
  expense_date: Date;
  category: string;
  status: string;
  department: string;
  requested_by?: string;
  approved_by?: string;
  receipt_url?: string;
}
