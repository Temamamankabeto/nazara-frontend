import type { BranchLite } from './branch.types';

export interface PaginatedResponse<T> {
  success?: boolean;
  message?: string;
  data: T[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface SupplierRow {
  id: number | string;
  branch_id?: number | string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  contact_person?: string | null;
  is_active?: boolean;
  branch?: BranchLite | null;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierFilters {
  page?: number;
  per_page?: number;
  search?: string;
  active?: '0' | '1' | 'all';
}

export interface SupplierFormPayload {
  branch_id?: number | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  contact_person?: string | null;
  is_active?: boolean;
}

export interface SupplierLedgerRow {
  id?: number | string;
  supplier_id: number | string;
  branch_id?: number | string | null;
  entry_date?: string;
  entry_type?: string;
  document_number?: string | null;
  debit?: number | string;
  credit?: number | string;
  balance_after?: number | string;
  narration?: string | null;
  supplier?: SupplierRow | null;
  branch?: BranchLite | null;
}

export interface SupplierBalanceRow {
  supplier_id: number | string;
  balance?: number | string;
  supplier?: SupplierRow | null;
  branch?: BranchLite | null;
}
