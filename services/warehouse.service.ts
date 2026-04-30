import api from '@/lib/axios';
import type { PaginatedResponse, WarehouseFilters, WarehouseFormPayload, WarehouseRow } from '@/types/warehouse.types';

function cleanFilters(filters: WarehouseFilters) {
  const params: Record<string, unknown> = { ...filters };
  if (!params.search) delete params.search;
  if (!params.branch_id || params.branch_id === 'all') delete params.branch_id;
  return params;
}

export async function getWarehouses(params: WarehouseFilters = {}): Promise<PaginatedResponse<WarehouseRow>> {
  const response = await api.get('/warehouses', { params: cleanFilters(params) });
  return response.data;
}

export async function createWarehouse(payload: WarehouseFormPayload) {
  const response = await api.post('/warehouses', payload);
  return response.data;
}

export async function updateWarehouse(id: string | number, payload: WarehouseFormPayload) {
  const response = await api.put(`/warehouses/${id}`, payload);
  return response.data;
}

export async function deleteWarehouse(id: string | number) {
  const response = await api.delete(`/warehouses/${id}`);
  return response.data;
}
