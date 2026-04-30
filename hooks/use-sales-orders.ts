import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveSalesOrder, createSalesOrder, dispatchSalesOrder } from '@/services/sales-order.service';
import { salesOrderKeys } from '@/queries/sales-order.queries';
import type { SalesOrderFormPayload } from '@/types/sales-order.types';

export function useCreateSalesOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createSalesOrder, onSuccess: () => queryClient.invalidateQueries({ queryKey: salesOrderKeys.all }) });
}

export function useApproveSalesOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: approveSalesOrder, onSuccess: () => queryClient.invalidateQueries({ queryKey: salesOrderKeys.all }) });
}

export function useDispatchSalesOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: dispatchSalesOrder, onSuccess: () => queryClient.invalidateQueries({ queryKey: salesOrderKeys.all }) });
}

export type { SalesOrderFormPayload };
