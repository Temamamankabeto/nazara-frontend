import { useQuery } from '@tanstack/react-query';
import { getSupplierBalances, getSupplierLedger, getSuppliers } from '@/services/supplier.service';
import type { SupplierFilters } from '@/types/supplier.types';

export const supplierKeys = {
  all: ['suppliers'] as const,
  list: (filters: SupplierFilters) => [...supplierKeys.all, 'list', filters] as const,
  ledger: (supplierId?: string | number) => [...supplierKeys.all, 'ledger', supplierId ?? 'all'] as const,
  balances: () => [...supplierKeys.all, 'balances'] as const,
};

export function useSuppliersQuery(filters: SupplierFilters = {}) {
  return useQuery({ queryKey: supplierKeys.list(filters), queryFn: () => getSuppliers(filters) });
}

export function useSupplierLedgerQuery(supplierId?: string | number) {
  return useQuery({ queryKey: supplierKeys.ledger(supplierId), queryFn: () => getSupplierLedger(supplierId) });
}

export function useSupplierBalancesQuery() {
  return useQuery({ queryKey: supplierKeys.balances(), queryFn: getSupplierBalances });
}
