import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCustomer, deleteCustomer, updateCustomer } from '@/services/customer.service';
import { customerKeys } from '@/queries/customer.queries';
import type { CustomerFormPayload } from '@/types/customer.types';

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createCustomer, onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }) });
}

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: CustomerFormPayload }) => updateCustomer(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  });
}

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deleteCustomer, onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }) });
}
