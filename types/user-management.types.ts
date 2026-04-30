export type UserStatusFilter = 'all' | 'active' | 'disabled';

export interface RoleLite { id: number | string; name: string; }
export interface BranchLite { id: number | string; name: string; code?: string | null; }

export interface UserRow {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  branch_id?: number | string | null;
  branch?: BranchLite | null;
  roles?: Array<string | RoleLite>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaginationMeta { current_page: number; per_page: number; total: number; last_page: number; }
export interface PaginatedResponse<T> { data: T[]; meta: PaginationMeta; }

export interface UserFilters { page?: number; per_page?: number; search?: string; status?: Exclude<UserStatusFilter, 'all'>; }
export interface UserFormPayload {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  branch_id?: number | null;
  role?: string;
  password?: string;
}
