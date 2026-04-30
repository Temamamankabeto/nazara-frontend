import api from '@/lib/axios';
import type {
  BatchAdjustmentPayload,
  InventoryFilters,
  LowStockRow,
  StockAdjustmentPayload,
  StockBalanceRow,
  StockMovementRow,
  StockValuationRow,
  StockValuationSummary,
  WarehouseSummaryRow,
  InventoryPaginatedResponse,
} from '@/types/inventory.types';

function cleanFilters(filters: InventoryFilters = {}) {
  const params: Record<string, unknown> = { ...filters };
  if (!params.warehouse_id || params.warehouse_id === 'all') delete params.warehouse_id;
  if (!params.product_id || params.product_id === 'all') delete params.product_id;
  if (!params.movement_type || params.movement_type === 'all') delete params.movement_type;
  if (!params.date_from) delete params.date_from;
  if (!params.date_to) delete params.date_to;
  return params;
}

export async function getStockBalance(params: InventoryFilters = {}): Promise<InventoryPaginatedResponse<StockBalanceRow>> {
  const response = await api.get('/reports/stock-balance', { params: cleanFilters(params) });
  return response.data;
}

export async function getLowStockAlerts(params: InventoryFilters = {}): Promise<InventoryPaginatedResponse<LowStockRow>> {
  const response = await api.get('/reports/low-stock', { params: cleanFilters(params) });
  return response.data;
}

export async function getStockMovements(params: InventoryFilters = {}): Promise<InventoryPaginatedResponse<StockMovementRow>> {
  const response = await api.get('/stock-movements', { params: cleanFilters(params) });
  return response.data;
}

export async function getAdjustmentReport(params: InventoryFilters = {}): Promise<InventoryPaginatedResponse<StockMovementRow>> {
  const response = await api.get('/reports/adjustments', { params: cleanFilters(params) });
  return response.data;
}

export async function createStockAdjustment(payload: StockAdjustmentPayload) {
  const { movement_type, ...rest } = payload;
  const endpoint = movement_type === 'damage' ? '/damaged-stock' : '/stock-adjustments';
  const response = await api.post(endpoint, rest);
  return response.data;
}

export async function createBatchStockAdjustment(payload: BatchAdjustmentPayload) {
  const response = await api.post('/stock-adjustments/batch', payload);
  return response.data;
}

export async function getStockValuation(params: InventoryFilters = {}): Promise<InventoryPaginatedResponse<StockValuationRow>> {
  const response = await api.get('/reports/stock-valuation', { params: cleanFilters(params) });
  return response.data;
}

export async function getStockValuationSummary(): Promise<{ success: boolean; data: StockValuationSummary; message?: string }> {
  const response = await api.get('/reports/stock-valuation-summary');
  return response.data;
}

export async function getWarehouseSummary(params: InventoryFilters = {}): Promise<InventoryPaginatedResponse<WarehouseSummaryRow>> {
  const response = await api.get('/reports/warehouse-summary', { params: cleanFilters(params) });
  return response.data;
}
