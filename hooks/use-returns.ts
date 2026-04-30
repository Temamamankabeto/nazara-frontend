import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveReturn, createReturn, processReturn } from '@/services/returns.service';
import { returnKeys } from '@/queries/returns.queries';

export function useCreateReturnMutation() { const queryClient = useQueryClient(); return useMutation({ mutationFn: createReturn, onSuccess: () => queryClient.invalidateQueries({ queryKey: returnKeys.all }) }); }
export function useApproveReturnMutation() { const queryClient = useQueryClient(); return useMutation({ mutationFn: approveReturn, onSuccess: () => queryClient.invalidateQueries({ queryKey: returnKeys.all }) }); }
export function useProcessReturnMutation() { const queryClient = useQueryClient(); return useMutation({ mutationFn: processReturn, onSuccess: () => queryClient.invalidateQueries({ queryKey: returnKeys.all }) }); }
