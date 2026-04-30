import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBranch, updateBranch } from '@/services/branch.service';
import { branchKeys } from '@/queries/branch.queries';
import type { BranchFormPayload } from '@/types/branch.types';

export function useCreateBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createBranch, onSuccess: () => queryClient.invalidateQueries({ queryKey: branchKeys.all }) });
}

export function useUpdateBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: BranchFormPayload }) => updateBranch(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: branchKeys.all }),
  });
}
