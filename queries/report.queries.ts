import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';
import type { ReportFilters } from '@/types/report.types';

export const reportKeys = {
  all: ['reports'] as const,
  salesDaily: (filters?: ReportFilters) => [...reportKeys.all, 'sales-daily', filters] as const,
  salesMonthly: (filters?: ReportFilters) => [...reportKeys.all, 'sales-monthly', filters] as const,
  topProducts: (filters?: ReportFilters) => [...reportKeys.all, 'top-products', filters] as const,
  salesByRegion: (filters?: ReportFilters) => [...reportKeys.all, 'sales-by-region', filters] as const,
  salesByDistributor: (filters?: ReportFilters) => [...reportKeys.all, 'sales-by-distributor', filters] as const,
  stockBalance: (filters?: ReportFilters) => [...reportKeys.all, 'stock-balance', filters] as const,
  lowStock: (filters?: ReportFilters) => [...reportKeys.all, 'low-stock', filters] as const,
  stockValuation: (filters?: ReportFilters) => [...reportKeys.all, 'stock-valuation', filters] as const,
  movementHistory: (filters?: ReportFilters) => [...reportKeys.all, 'movement-history', filters] as const,
  warehouseSummary: (filters?: ReportFilters) => [...reportKeys.all, 'warehouse-summary', filters] as const,
  inventoryAdvanced: (filters?: ReportFilters) => [...reportKeys.all, 'inventory-advanced', filters] as const,
  customerBalances: (filters?: ReportFilters) => [...reportKeys.all, 'customer-balances', filters] as const,
  supplierBalances: (filters?: ReportFilters) => [...reportKeys.all, 'supplier-balances', filters] as const,
  paymentSummary: (filters?: ReportFilters) => [...reportKeys.all, 'payment-summary', filters] as const,
  profitEstimation: (filters?: ReportFilters) => [...reportKeys.all, 'profit-estimation', filters] as const,
  operationalAdvanced: (filters?: ReportFilters) => [...reportKeys.all, 'operational-advanced', filters] as const,
  purchaseSummary: (filters?: ReportFilters) => [...reportKeys.all, 'purchase-summary', filters] as const,
  returnsSummary: (filters?: ReportFilters) => [...reportKeys.all, 'returns-summary', filters] as const,
  adjustmentReport: (filters?: ReportFilters) => [...reportKeys.all, 'adjustment-report', filters] as const,
  inactiveCustomers: (filters?: ReportFilters) => [...reportKeys.all, 'inactive-customers', filters] as const,
};

export function useSalesDailyReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.salesDaily(filters), queryFn: () => reportService.salesDaily(filters) }); }
export function useSalesMonthlyReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.salesMonthly(filters), queryFn: () => reportService.salesMonthly(filters) }); }
export function useTopProductsReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.topProducts(filters), queryFn: () => reportService.topProducts(filters) }); }
export function useSalesByRegionReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.salesByRegion(filters), queryFn: () => reportService.salesByRegion(filters) }); }
export function useSalesByDistributorReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.salesByDistributor(filters), queryFn: () => reportService.salesByDistributor(filters) }); }
export function useReportStockBalance(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.stockBalance(filters), queryFn: () => reportService.stockBalance(filters) }); }
export function useReportLowStock(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.lowStock(filters), queryFn: () => reportService.lowStock(filters) }); }
export function useReportStockValuation(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.stockValuation(filters), queryFn: () => reportService.stockValuation(filters), retry: false }); }
export function useReportMovementHistory(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.movementHistory(filters), queryFn: () => reportService.movementHistory(filters), retry: false }); }
export function useWarehouseSummaryReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.warehouseSummary(filters), queryFn: () => reportService.warehouseSummary(filters), retry: false }); }
export function useInventoryAdvancedReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.inventoryAdvanced(filters), queryFn: () => reportService.inventoryAdvanced(filters), retry: false }); }
export function useCustomerBalancesReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.customerBalances(filters), queryFn: () => reportService.customerBalances(filters) }); }
export function useSupplierBalancesReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.supplierBalances(filters), queryFn: () => reportService.supplierBalances(filters), retry: false }); }
export function usePaymentSummaryReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.paymentSummary(filters), queryFn: () => reportService.paymentSummary(filters) }); }
export function useProfitEstimationReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.profitEstimation(filters), queryFn: () => reportService.profitEstimation(filters), retry: false }); }
export function useOperationalAdvancedReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.operationalAdvanced(filters), queryFn: () => reportService.operationalAdvanced(filters), retry: false }); }
export function usePurchaseSummaryReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.purchaseSummary(filters), queryFn: () => reportService.purchaseSummary(filters), retry: false }); }
export function useReturnsSummaryReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.returnsSummary(filters), queryFn: () => reportService.returnsSummary(filters), retry: false }); }
export function useAdjustmentReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.adjustmentReport(filters), queryFn: () => reportService.adjustmentReport(filters), retry: false }); }
export function useInactiveCustomersReport(filters?: ReportFilters) { return useQuery({ queryKey: reportKeys.inactiveCustomers(filters), queryFn: () => reportService.inactiveCustomers(filters), retry: false }); }
