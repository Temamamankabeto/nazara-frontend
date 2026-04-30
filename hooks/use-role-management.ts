import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignRolePermissions, createPermission, createRole, deletePermission, updatePermission, updateRole } from '@/services/role-management.service';
import { roleManagementKeys } from '@/queries/role-management.queries';
import type { PermissionFormPayload, RoleFormPayload } from '@/types/role-management.types';

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createRole, onSuccess: () => queryClient.invalidateQueries({ queryKey: roleManagementKeys.all }) });
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: string | number; payload: RoleFormPayload }) => updateRole(id, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: roleManagementKeys.all }) });
}

export function useCreatePermissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createPermission, onSuccess: () => queryClient.invalidateQueries({ queryKey: roleManagementKeys.all }) });
}

export function useUpdatePermissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: string | number; payload: PermissionFormPayload }) => updatePermission(id, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: roleManagementKeys.all }) });
}

export function useDeletePermissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deletePermission, onSuccess: () => queryClient.invalidateQueries({ queryKey: roleManagementKeys.all }) });
}

export function useAssignRolePermissionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string | number; permissions: string[] }) => assignRolePermissions(id, { permissions }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.all });
      queryClient.invalidateQueries({ queryKey: roleManagementKeys.rolePermissions(variables.id) });
    },
  });
}
