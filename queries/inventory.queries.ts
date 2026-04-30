import { useQuery } from '@tanstack/react-query';
import {
  getAdjustmentReport,
  getLowStockAlerts,
  getStockBalance,
  getStockMovements,
  getStockValuation,
  getStockValuationSummary,
  getWarehouseSummary,
} from '@/services/inventory.service';
import type { InventoryFilters } from '@/types/inventory.types';

export const inventoryKeys = {
  all: ['inventory'] as const,
  balance: (filters: InventoryFilters) => [...inventoryKeys.all, 'stock-balance', filters] as const,
  lowStock: (filters: InventoryFilters) => [...inventoryKeys.all, 'low-stock', filters] as const,
  movements: (filters: InventoryFilters) => [...inventoryKeys.all, 'stock-movements', filters] as const,
  adjustments: (filters: InventoryFilters) => [...inventoryKeys.all, 'stock-adjustments', filters] as const,
  valuation: (filters: InventoryFilters) => [...inventoryKeys.all, 'stock-valuation', filters] as const,
  valuationSummary: () => [...inventoryKeys.all, 'stock-valuation-summary'] as const,
  warehouseSummary: (filters: InventoryFilters) => [...inventoryKeys.all, 'warehouse-summary', filters] as const,
};

export function useStockBalanceQuery(filters: InventoryFilters = {}) {
  return useQuery({ queryKey: inventoryKeys.balance(filters), queryFn: () => getStockBalance(filters) });
}

export function useLowStockAlertsQuery(filters: InventoryFilters = {}) {
  return useQuery({ queryKey: inventoryKeys.lowStock(filters), queryFn: () => getLowStockAlerts(filters) });
}

export function useStockMovementsQuery(filters: InventoryFilters = {}) {
  return useQuery({ queryKey: inventoryKeys.movements(filters), queryFn: () => getStockMovements(filters), retry: false });
}

export function useAdjustmentReportQuery(filters: InventoryFilters = {}) {
  return useQuery({ queryKey: inventoryKeys.adjustments(filters), queryFn: () => getAdjustmentReport(filters), retry: false });
}

export function useStockValuationQuery(filters: InventoryFilters = {}) {
  return useQuery({ queryKey: inventoryKeys.valuation(filters), queryFn: () => getStockValuation(filters), retry: false });
}

export function useStockValuationSummaryQuery() {
  return useQuery({ queryKey: inventoryKeys.valuationSummary(), queryFn: getStockValuationSummary, retry: false });
}

export function useWarehouseSummaryQuery(filters: InventoryFilters = {}) {
  return useQuery({ queryKey: inventoryKeys.warehouseSummary(filters), queryFn: () => getWarehouseSummary(filters), retry: false });
}
