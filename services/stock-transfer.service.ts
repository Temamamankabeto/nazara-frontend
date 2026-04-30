import api from '@/lib/axios';
import type { PaginatedResponse, StockTransferFilters, StockTransferFormPayload, StockTransferRow } from '@/types/stock-transfer.types';

function cleanFilters(filters: StockTransferFilters) {
  const params: Record<string, unknown> = { ...filters };
  if (!params.status || params.status === 'all') delete params.status;
  return params;
}

export async function getStockTransfers(params: StockTransferFilters = {}): Promise<PaginatedResponse<StockTransferRow>> {
  const response = await api.get('/stock-transfers', { params: cleanFilters(params) });
  return response.data;
}

export async function createStockTransfer(payload: StockTransferFormPayload) {
  const response = await api.post('/stock-transfers', payload);
  return response.data;
}

export async function approveStockTransfer(id: string | number) {
  const response = await api.post(`/stock-transfers/${id}/approve`);
  return response.data;
}

export async function completeStockTransfer(id: string | number) {
  const response = await api.post(`/stock-transfers/${id}/complete`);
  return response.data;
}

export async function cancelStockTransfer(id: string | number, reason?: string) {
  const response = await api.post(`/stock-transfers/${id}/cancel`, { reason });
  return response.data;
}
