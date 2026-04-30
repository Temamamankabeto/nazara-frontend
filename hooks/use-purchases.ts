import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPurchaseOrder, receivePurchaseOrder } from '@/services/purchase.service';
import { purchaseKeys } from '@/queries/purchase.queries';
import { inventoryKeys } from '@/queries/inventory.queries';
import type { PurchaseOrderPayload, ReceivePurchasePayload } from '@/types/purchase.types';

export function useCreatePurchaseOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PurchaseOrderPayload) => createPurchaseOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
    },
  });
}

export function useReceivePurchaseOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: ReceivePurchasePayload }) => receivePurchaseOrder(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}
