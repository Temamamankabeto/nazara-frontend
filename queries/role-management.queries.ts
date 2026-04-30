import { useQuery } from '@tanstack/react-query';
import { getPermissions, getRolePermissions, getRoles } from '@/services/role-management.service';
import type { PermissionFilters, RoleFilters } from '@/types/role-management.types';

export const roleManagementKeys = {
  all: ['role-management'] as const,
  roles: (filters: RoleFilters) => [...roleManagementKeys.all, 'roles', filters] as const,
  permissions: (filters: PermissionFilters) => [...roleManagementKeys.all, 'permissions', filters] as const,
  rolePermissions: (id: string | number | null) => [...roleManagementKeys.all, 'role-permissions', id] as const,
};

export function useRolesQuery(filters: RoleFilters = {}) {
  return useQuery({ queryKey: roleManagementKeys.roles(filters), queryFn: () => getRoles(filters) });
}

export function usePermissionsQuery(filters: PermissionFilters = {}) {
  return useQuery({ queryKey: roleManagementKeys.permissions(filters), queryFn: () => getPermissions(filters) });
}

export function useRolePermissionsQuery(id: string | number | null) {
  return useQuery({ queryKey: roleManagementKeys.rolePermissions(id), queryFn: () => getRolePermissions(id as string | number), enabled: id !== null && id !== undefined });
}
