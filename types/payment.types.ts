import type { BranchRow } from './branch.types';
import type { CustomerLite, UserLite } from './sales-order.types';
import type { InvoiceRow } from './invoice.types';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_payment' | 'credit_settlement';
export type PaymentStatus = 'recorded' | 'verified' | 'returned' | 'failed';

export interface PaymentRow {
  id: number | string;
  branch_id?: number | string | null;
  invoice_id: number | string;
  customer_id?: number | string | null;
  received_by?: number | string | null;
  payment_date: string;
  amount: number | string;
  method: PaymentMethod | string;
  reference?: string | null;
  receipt_path?: string | null;
  receipt_original_name?: string | null;
  notes?: string | null;
  status: PaymentStatus | string;
  verified_at?: string | null;
  branch?: BranchRow | null;
  invoice?: InvoiceRow | null;
  customer?: CustomerLite | null;
  receiver?: UserLite | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentFilters {
  page?: number;
  per_page?: number;
  method?: string;
  status?: string;
  branch_id?: string | number | null;
}

export interface PaymentFormPayload {
  invoice_id: number;
  payment_date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
  status?: PaymentStatus;
  receipt?: File | null;
}

export interface PaginatedResponse<T> {
  success?: boolean;
  message?: string;
  data: T[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number };
}

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'mobile_payment', label: 'Mobile payment' },
  { value: 'credit_settlement', label: 'Credit settlement' },
];

export const PAYMENT_STATUSES = [
  { value: 'recorded', label: 'Recorded' },
  { value: 'verified', label: 'Verified' },
  { value: 'returned', label: 'Returned' },
  { value: 'failed', label: 'Failed' },
];
