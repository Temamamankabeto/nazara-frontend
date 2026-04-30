import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWarehouse, deleteWarehouse, updateWarehouse } from '@/services/warehouse.service';
import { warehouseKeys } from '@/queries/warehouse.queries';
import type { WarehouseFormPayload } from '@/types/warehouse.types';

export function useCreateWarehouseMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createWarehouse, onSuccess: () => queryClient.invalidateQueries({ queryKey: warehouseKeys.all }) });
}

export function useUpdateWarehouseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: WarehouseFormPayload }) => updateWarehouse(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: warehouseKeys.all }),
  });
}

export function useDeleteWarehouseMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deleteWarehouse, onSuccess: () => queryClient.invalidateQueries({ queryKey: warehouseKeys.all }) });
}
