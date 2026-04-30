export interface BranchLite {
  id: number | string;
  name: string;
  code?: string | null;
}

export type CustomerType = 'distributor' | 'retailer' | 'supermarket' | 'institutional_buyer';

export interface CustomerRow {
  id: number | string;
  branch_id?: number | string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  region?: string | null;
  customer_type?: CustomerType | string;
  price_level?: string | null;
  credit_limit?: number | string | null;
  opening_balance?: number | string | null;
  current_balance?: number | string | null;
  is_active?: boolean;
  branch?: BranchLite | null;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerLedgerRow {
  id: number | string;
  branch_id?: number | string | null;
  customer_id: number | string;
  entry_date?: string | null;
  entry_type?: string | null;
  reference_type?: string | null;
  reference_id?: number | string | null;
  document_number?: string | null;
  debit?: number | string | null;
  credit?: number | string | null;
  balance_after?: number | string | null;
  narration?: string | null;
  customer?: CustomerRow | null;
  branch?: BranchLite | null;
}

export interface CustomerBalanceRow {
  customer_id: number | string;
  balance?: number | string | null;
  customer?: CustomerRow | null;
  branch?: BranchLite | null;
}

export interface CustomerRegionSummary {
  region: string;
  total_customers: number;
  active_customers: number;
  credit_limit: number;
  balance: number;
}

export interface CustomerFilters {
  page?: number;
  per_page?: number;
  search?: string;
  customer_type?: string;
  branch_id?: string | number | null;
  region?: string;
  price_level?: string;
  is_active?: boolean | string;
}

export interface LedgerFilters {
  page?: number;
  per_page?: number;
  customer_id?: string | number | null;
  branch_id?: string | number | null;
}

export interface CustomerFormPayload {
  branch_id?: number | string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  region?: string | null;
  customer_type: string;
  price_level?: string | null;
  credit_limit?: number;
  opening_balance?: number;
  is_active?: boolean;
}

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

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export const CUSTOMER_TYPES = [
  { value: 'distributor', label: 'Distributor' },
  { value: 'retailer', label: 'Retailer' },
  { value: 'supermarket', label: 'Supermarket' },
  { value: 'institutional_buyer', label: 'Institutional Buyer' },
];

export const CUSTOMER_PRICE_LEVELS = [
  { value: 'standard', label: 'Standard' },
  { value: 'wholesale_a', label: 'Wholesale A' },
  { value: 'wholesale_b', label: 'Wholesale B' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'vip', label: 'VIP / Contract' },
];
