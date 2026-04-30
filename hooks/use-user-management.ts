import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignUserRole, createUser, resetUserPassword, toggleUserStatus, updateUser } from '@/services/user-management.service';
import { userManagementKeys } from '@/queries/user-management.queries';
import type { UserFormPayload } from '@/types/user-management.types';

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createUser, onSuccess: () => queryClient.invalidateQueries({ queryKey: userManagementKeys.all }) });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UserFormPayload }) => updateUser(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userManagementKeys.all }),
  });
}

export function useToggleUserStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: toggleUserStatus, onSuccess: () => queryClient.invalidateQueries({ queryKey: userManagementKeys.all }) });
}

export function useAssignUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string | number; role: string }) => assignUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userManagementKeys.all }),
  });
}

export function useResetUserPasswordMutation() {
  return useMutation({ mutationFn: ({ id, new_password }: { id: string | number; new_password: string }) => resetUserPassword(id, new_password) });
}
