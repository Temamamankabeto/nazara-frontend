import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveStockTransfer, cancelStockTransfer, completeStockTransfer, createStockTransfer } from '@/services/stock-transfer.service';
import { stockTransferKeys } from '@/queries/stock-transfer.queries';

export function useCreateStockTransferMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createStockTransfer, onSuccess: () => queryClient.invalidateQueries({ queryKey: stockTransferKeys.all }) });
}

export function useApproveStockTransferMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: approveStockTransfer, onSuccess: () => queryClient.invalidateQueries({ queryKey: stockTransferKeys.all }) });
}

export function useCompleteStockTransferMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: completeStockTransfer, onSuccess: () => queryClient.invalidateQueries({ queryKey: stockTransferKeys.all }) });
}

export function useCancelStockTransferMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string | number; reason?: string }) => cancelStockTransfer(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stockTransferKeys.all }),
  });
}
