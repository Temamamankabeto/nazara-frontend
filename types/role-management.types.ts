export interface RoleRow {
  id: number | string;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionRow {
  id: number | string;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoleFilters { search?: string; }
export interface PermissionFilters { search?: string; }

export interface RoleFormPayload { name: string; }
export interface PermissionFormPayload { name: string; }
export interface AssignRolePermissionsPayload { permissions: string[]; }

export interface ApiListResponse<T> { success?: boolean; message?: string; data: T[]; }
