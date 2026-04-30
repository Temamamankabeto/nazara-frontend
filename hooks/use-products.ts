import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, deleteProduct, toggleProductStatus, updateProduct } from '@/services/product.service';
import { productKeys } from '@/queries/product.queries';
import type { ProductFormPayload } from '@/types/product.types';

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createProduct, onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }) });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: ProductFormPayload }) => updateProduct(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}

export function useToggleProductStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: toggleProductStatus, onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }) });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deleteProduct, onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }) });
}
