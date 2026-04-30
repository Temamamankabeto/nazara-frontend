import { useQuery } from '@tanstack/react-query';
import { getBranches, getRolesLite, getUsers } from '@/services/user-management.service';
import type { UserFilters } from '@/types/user-management.types';

export const userManagementKeys = {
  all: ['user-management'] as const,
  users: (filters: UserFilters) => [...userManagementKeys.all, 'users', filters] as const,
  roles: () => [...userManagementKeys.all, 'roles-lite'] as const,
  branches: () => [...userManagementKeys.all, 'branches'] as const,
};

export function useUsersQuery(filters: UserFilters) {
  return useQuery({ queryKey: userManagementKeys.users(filters), queryFn: () => getUsers(filters) });
}

export function useRolesLiteQuery() {
  return useQuery({ queryKey: userManagementKeys.roles(), queryFn: getRolesLite });
}

export function useBranchesQuery() {
  return useQuery({ queryKey: userManagementKeys.branches(), queryFn: () => getBranches({ per_page: 100 }) });
}
