import { useQuery } from '@tanstack/react-query';
import { getWarehouses } from '@/services/warehouse.service';
import type { WarehouseFilters } from '@/types/warehouse.types';

export const warehouseKeys = {
  all: ['warehouses'] as const,
  list: (filters: WarehouseFilters) => [...warehouseKeys.all, 'list', filters] as const,
};

export function useWarehousesQuery(filters: WarehouseFilters = {}) {
  return useQuery({ queryKey: warehouseKeys.list(filters), queryFn: () => getWarehouses(filters) });
}
