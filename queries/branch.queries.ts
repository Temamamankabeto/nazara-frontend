import { useQuery } from '@tanstack/react-query';
import { getBranches } from '@/services/branch.service';
import type { BranchFilters } from '@/types/branch.types';

export const branchKeys = {
  all: ['branches'] as const,
  list: (filters: BranchFilters) => [...branchKeys.all, 'list', filters] as const,
};

export function useBranchesQuery(filters: BranchFilters = {}) {
  return useQuery({ queryKey: branchKeys.list(filters), queryFn: () => getBranches(filters) });
}
