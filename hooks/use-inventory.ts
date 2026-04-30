import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBatchStockAdjustment, createStockAdjustment } from '@/services/inventory.service';
import { inventoryKeys } from '@/queries/inventory.queries';
import type { BatchAdjustmentPayload, StockAdjustmentPayload } from '@/types/inventory.types';

export function useCreateStockAdjustmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StockAdjustmentPayload) => createStockAdjustment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
  });
}

export function useCreateBatchStockAdjustmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BatchAdjustmentPayload) => createBatchStockAdjustment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
  });
}
