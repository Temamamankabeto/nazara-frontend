import api from '@/lib/axios';
import type { PaginatedResponse, SalesOrderFilters, SalesOrderFormPayload, SalesOrderRow } from '@/types/sales-order.types';
import type { CustomerRow } from '@/types/customer.types';
import type { ProductRow } from '@/types/product.types';
import type { WarehouseRow } from '@/types/warehouse.types';

function cleanFilters(filters: SalesOrderFilters) {
  const params: Record<string, unknown> = { ...filters };
  if (!params.status || params.status === 'all') delete params.status;
  if (!params.branch_id || params.branch_id === 'all') delete params.branch_id;
  return params;
}

export async function getSalesOrders(params: SalesOrderFilters = {}): Promise<PaginatedResponse<SalesOrderRow>> {
  const response = await api.get('/sales-orders', { params: cleanFilters(params) });
  return response.data;
}

export async function createSalesOrder(payload: SalesOrderFormPayload) {
  const response = await api.post('/sales-orders', payload);
  return response.data;
}

export async function approveSalesOrder(id: string | number) {
  const response = await api.post(`/sales-orders/${id}/approve`);
  return response.data;
}

export async function dispatchSalesOrder(id: string | number) {
  const response = await api.post(`/sales-orders/${id}/dispatch`);
  return response.data;
}

export async function getCustomersLite(): Promise<PaginatedResponse<CustomerRow>> {
  const response = await api.get('/customers', { params: { per_page: 100 } });
  return response.data;
}

export async function getWarehousesLite(): Promise<PaginatedResponse<WarehouseRow>> {
  const response = await api.get('/warehouses', { params: { per_page: 100 } });
  return response.data;
}

export async function getProductsLite(): Promise<PaginatedResponse<ProductRow>> {
  const response = await api.get('/products', { params: { per_page: 100, active: 1 } });
  return response.data;
}
