import type { CustomerLite, SalesOrderRow, UserLite } from './sales-order.types';
import type { BranchRow } from './branch.types';

export type InvoiceStatus = 'issued' | 'unpaid' | 'partial' | 'paid' | 'void' | 'overdue' | string;

export interface InvoicePaymentRow {
  id: number | string;
  invoice_id: number | string;
  customer_id?: number | string | null;
  payment_date: string;
  amount: number | string;
  method: string;
  reference?: string | null;
  notes?: string | null;
  status: string;
  receiver?: UserLite | null;
  created_at?: string;
}

export interface InvoiceRow {
  id: number | string;
  branch_id?: number | string | null;
  invoice_number?: string | null;
  sales_order_id?: number | string | null;
  customer_id?: number | string | null;
  invoice_date: string;
  due_date?: string | null;
  status: InvoiceStatus;
  subtotal?: number | string;
  discount?: number | string;
  tax?: number | string;
  transport_charge?: number | string;
  total?: number | string;
  paid_amount?: number | string;
  balance?: number | string;
  branch?: BranchRow | null;
  customer?: CustomerLite | null;
  sales_order?: SalesOrderRow | null;
  salesOrder?: SalesOrderRow | null;
  payments?: InvoicePaymentRow[];
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceFilters {
  page?: number;
  per_page?: number;
  status?: string;
  branch_id?: string | number | null;
}

export interface PaginatedResponse<T> {
  success?: boolean;
  message?: string;
  data: T[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number };
}

export const INVOICE_STATUSES = [
  { value: 'issued', label: 'Issued' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'void', label: 'Void' },
];
