import { useQuery } from '@tanstack/react-query';
import { getCustomersLite, getProductsLite, getSalesOrders, getWarehousesLite } from '@/services/sales-order.service';
import type { SalesOrderFilters } from '@/types/sales-order.types';

export const salesOrderKeys = {
  all: ['sales-orders'] as const,
  list: (filters: SalesOrderFilters) => [...salesOrderKeys.all, 'list', filters] as const,
  customers: () => [...salesOrderKeys.all, 'customers-lite'] as const,
  warehouses: () => [...salesOrderKeys.all, 'warehouses-lite'] as const,
  products: () => [...salesOrderKeys.all, 'products-lite'] as const,
};

export function useSalesOrdersQuery(filters: SalesOrderFilters = {}) {
  return useQuery({ queryKey: salesOrderKeys.list(filters), queryFn: () => getSalesOrders(filters) });
}

export function useSalesOrderCustomersQuery() {
  return useQuery({ queryKey: salesOrderKeys.customers(), queryFn: getCustomersLite });
}

export function useSalesOrderWarehousesQuery() {
  return useQuery({ queryKey: salesOrderKeys.warehouses(), queryFn: getWarehousesLite });
}

export function useSalesOrderProductsQuery() {
  return useQuery({ queryKey: salesOrderKeys.products(), queryFn: getProductsLite });
}
