export interface BranchRow {
  id: number | string;
  name: string;
  code: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BranchFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface BranchFormPayload {
  name: string;
  code: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
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

export type BranchLite = BranchRow;
