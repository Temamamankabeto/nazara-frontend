export interface BranchLite {
  id: number | string;
  name: string;
  code?: string | null;
}

export interface WarehouseRow {
  id: number | string;
  branch_id?: number | string | null;
  name: string;
  code: string;
  location?: string | null;
  manager_name?: string | null;
  is_active?: boolean;
  branch?: BranchLite | null;
  created_at?: string;
  updated_at?: string;
}

export interface WarehouseFilters {
  page?: number;
  per_page?: number;
  search?: string;
  branch_id?: string | number | null;
}

export interface WarehouseFormPayload {
  branch_id?: number | string | null;
  name: string;
  code: string;
  location?: string | null;
  manager_name?: string | null;
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
