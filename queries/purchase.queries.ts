import { useQuery } from '@tanstack/react-query';
import { getPurchaseOrders } from '@/services/purchase.service';
import type { PurchaseFilters } from '@/types/purchase.types';

export const purchaseKeys = {
  all: ['purchase-orders'] as const,
  list: (filters: PurchaseFilters) => [...purchaseKeys.all, 'list', filters] as const,
};

export function usePurchaseOrdersQuery(filters: PurchaseFilters = {}) {
  return useQuery({ queryKey: purchaseKeys.list(filters), queryFn: () => getPurchaseOrders(filters) });
}
