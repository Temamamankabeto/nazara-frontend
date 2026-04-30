import { useQuery } from '@tanstack/react-query';
import { getReturnCustomers, getReturnProducts, getReturns, getReturnSuppliers, getReturnWarehouses } from '@/services/returns.service';
import type { ReturnFilters } from '@/types/returns.types';

export const returnKeys = { all: ['returns'] as const, list: (filters: ReturnFilters) => [...returnKeys.all, 'list', filters] as const, customers: () => [...returnKeys.all, 'customers'] as const, suppliers: () => [...returnKeys.all, 'suppliers'] as const, products: () => [...returnKeys.all, 'products'] as const, warehouses: () => [...returnKeys.all, 'warehouses'] as const };
export function useReturnsQuery(filters: ReturnFilters = {}) { return useQuery({ queryKey: returnKeys.list(filters), queryFn: () => getReturns(filters) }); }
export function useReturnCustomersQuery() { return useQuery({ queryKey: returnKeys.customers(), queryFn: getReturnCustomers }); }
export function useReturnSuppliersQuery() { return useQuery({ queryKey: returnKeys.suppliers(), queryFn: getReturnSuppliers }); }
export function useReturnProductsQuery() { return useQuery({ queryKey: returnKeys.products(), queryFn: getReturnProducts }); }
export function useReturnWarehousesQuery() { return useQuery({ queryKey: returnKeys.warehouses(), queryFn: getReturnWarehouses }); }
