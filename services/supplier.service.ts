import api from '@/lib/axios';
import type { PaginatedResponse, SupplierBalanceRow, SupplierFilters, SupplierFormPayload, SupplierLedgerRow, SupplierRow } from '@/types/supplier.types';

function cleanFilters(filters: SupplierFilters = {}) {
  const params: Record<string, unknown> = { ...filters };
  if (params.active === 'all') delete params.active;
  return params;
}

export async function getSuppliers(params: SupplierFilters = {}): Promise<PaginatedResponse<SupplierRow>> {
  const response = await api.get('/suppliers', { params: cleanFilters(params) });
  return response.data;
}

export async function getSupplier(id: string | number) {
  const response = await api.get(`/suppliers/${id}`);
  return response.data;
}

export async function createSupplier(payload: SupplierFormPayload) {
  const response = await api.post('/suppliers', payload);
  return response.data;
}

export async function updateSupplier(id: string | number, payload: SupplierFormPayload) {
  const response = await api.put(`/suppliers/${id}`, payload);
  return response.data;
}

export async function toggleSupplierStatus(id: string | number) {
  const response = await api.patch(`/suppliers/${id}/toggle`);
  return response.data;
}

export async function deleteSupplier(id: string | number) {
  const response = await api.delete(`/suppliers/${id}`);
  return response.data;
}

export async function getSupplierLedger(supplierId?: string | number): Promise<PaginatedResponse<SupplierLedgerRow>> {
  const response = await api.get('/ledgers/suppliers', { params: { per_page: 100, supplier_id: supplierId || undefined } });
  return response.data;
}

export async function getSupplierBalances(): Promise<{ success?: boolean; message?: string; data: SupplierBalanceRow[] }> {
  const response = await api.get('/reports/supplier-balances');
  return response.data;
}
