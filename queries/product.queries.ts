import { useQuery } from '@tanstack/react-query';
import { getProducts, getSuppliersLite } from '@/services/product.service';
import type { ProductFilters } from '@/types/product.types';

export const productKeys = {
  all: ['products'] as const,
  list: (filters: ProductFilters) => [...productKeys.all, 'list', filters] as const,
  suppliers: () => [...productKeys.all, 'suppliers-lite'] as const,
};

export function useProductsQuery(filters: ProductFilters = {}) {
  return useQuery({ queryKey: productKeys.list(filters), queryFn: () => getProducts(filters) });
}

export function useSuppliersLiteQuery() {
  return useQuery({ queryKey: productKeys.suppliers(), queryFn: getSuppliersLite });
}
