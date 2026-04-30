import api from '@/lib/axios';
import type { ReportFilters, ReportResponse } from '@/types/report.types';

const clean = (params?: ReportFilters) => Object.fromEntries(Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== 'all'));

export const reportService = {
  salesDaily: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/sales/daily', { params: clean(params) }).then((r) => r.data),
  salesMonthly: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/sales/monthly', { params: clean(params) }).then((r) => r.data),
  topProducts: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/sales/top-products', { params: clean(params) }).then((r) => r.data),
  salesByRegion: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/sales/by-region', { params: clean(params) }).then((r) => r.data),
  salesByDistributor: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/sales/by-distributor', { params: clean(params) }).then((r) => r.data),

  stockBalance: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/stock-balance', { params: clean(params) }).then((r) => r.data),
  lowStock: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/low-stock', { params: clean(params) }).then((r) => r.data),
  stockValuation: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/stock-valuation', { params: clean(params) }).then((r) => r.data),
  movementHistory: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/stock-movements', { params: clean(params) }).then((r) => r.data),
  warehouseSummary: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/warehouse-summary', { params: clean(params) }).then((r) => r.data),
  inventoryAdvanced: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/inventory/advanced', { params: clean(params) }).then((r) => r.data),

  customerBalances: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/customer-balances', { params: clean(params) }).then((r) => r.data),
  supplierBalances: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/supplier-balances', { params: clean(params) }).then((r) => r.data),
  paymentSummary: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/payments/summary', { params: clean(params) }).then((r) => r.data),
  profitEstimation: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/profit-estimation', { params: clean(params) }).then((r) => r.data),

  operationalAdvanced: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/operations/advanced', { params: clean(params) }).then((r) => r.data),
  purchaseSummary: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/purchases/summary', { params: clean(params) }).then((r) => r.data),
  returnsSummary: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/returns/summary', { params: clean(params) }).then((r) => r.data),
  adjustmentReport: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/stock-adjustments', { params: clean(params) }).then((r) => r.data),
  inactiveCustomers: (params?: ReportFilters): Promise<ReportResponse> => api.get('/reports/customers/inactive', { params: clean(params) }).then((r) => r.data),
};
