import api from '@/lib/axios';
import type { PaginatedResponse, PurchaseFilters, PurchaseOrderPayload, PurchaseOrderRow, ReceivePurchasePayload } from '@/types/purchase.types';

function cleanFilters(filters: PurchaseFilters = {}) {
  const params: Record<string, unknown> = { ...filters };
  if (!params.status || params.status === 'all') delete params.status;
  return params;
}

export async function getPurchaseOrders(filters: PurchaseFilters = {}): Promise<PaginatedResponse<PurchaseOrderRow>> {
  const response = await api.get('/purchase-orders', { params: cleanFilters(filters) });
  return response.data;
}

export async function createPurchaseOrder(payload: PurchaseOrderPayload) {
  const response = await api.post('/purchase-orders', payload);
  return response.data;
}

export async function receivePurchaseOrder(id: string | number, payload: ReceivePurchasePayload) {
  const response = await api.post(`/purchase-orders/${id}/receive`, payload);
  return response.data;
}
