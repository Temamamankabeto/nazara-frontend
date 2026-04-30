import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupplier, deleteSupplier, toggleSupplierStatus, updateSupplier } from '@/services/supplier.service';
import { supplierKeys } from '@/queries/supplier.queries';
import type { SupplierFormPayload } from '@/types/supplier.types';

export function useCreateSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createSupplier, onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.all }) });
}

export function useUpdateSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: SupplierFormPayload }) => updateSupplier(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.all }),
  });
}

export function useToggleSupplierStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: toggleSupplierStatus, onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.all }) });
}

export function useDeleteSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deleteSupplier, onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.all }) });
}
