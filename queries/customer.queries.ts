import { useQuery } from '@tanstack/react-query';
import { getCustomer, getCustomerBalances, getCustomerLedger, getCustomerRegions, getCustomers } from '@/services/customer.service';
import type { CustomerFilters, LedgerFilters } from '@/types/customer.types';

export const customerKeys = {
  all: ['customers'] as const,
  list: (filters: CustomerFilters) => [...customerKeys.all, 'list', filters] as const,
  detail: (id: string | number) => [...customerKeys.all, 'detail', id] as const,
  ledger: (filters: LedgerFilters) => [...customerKeys.all, 'ledger', filters] as const,
  balances: ['customers', 'balances'] as const,
  regions: ['customers', 'regions'] as const,
};

export function useCustomersQuery(filters: CustomerFilters = {}) {
  return useQuery({ queryKey: customerKeys.list(filters), queryFn: () => getCustomers(filters) });
}

export function useCustomerQuery(id: string | number) {
  return useQuery({ queryKey: customerKeys.detail(id), queryFn: () => getCustomer(id), enabled: Boolean(id) });
}

export function useCustomerLedgerQuery(filters: LedgerFilters = {}) {
  return useQuery({ queryKey: customerKeys.ledger(filters), queryFn: () => getCustomerLedger(filters) });
}

export function useCustomerBalancesQuery() {
  return useQuery({ queryKey: customerKeys.balances, queryFn: getCustomerBalances });
}

export function useCustomerRegionsQuery() {
  return useQuery({ queryKey: customerKeys.regions, queryFn: getCustomerRegions });
}
