import api from '@/lib/axios';
import type { PaginatedResponse, ReturnFilters, ReturnFormPayload, ReturnRow } from '@/types/returns.types';
import type { CustomerRow } from '@/types/customer.types';
import type { SupplierRow } from '@/types/supplier.types';
import type { ProductRow } from '@/types/product.types';
import type { WarehouseRow } from '@/types/warehouse.types';

function cleanFilters(filters: ReturnFilters) { const params: Record<string, unknown> = { ...filters }; if (!params.status || params.status === 'all') delete params.status; if (!params.return_type || params.return_type === 'all') delete params.return_type; if (!params.branch_id || params.branch_id === 'all') delete params.branch_id; return params; }
export async function getReturns(params: ReturnFilters = {}): Promise<PaginatedResponse<ReturnRow>> { const response = await api.get('/returns', { params: cleanFilters(params) }); return response.data; }
export async function createReturn(payload: ReturnFormPayload) { const response = await api.post('/returns', payload); return response.data; }
export async function approveReturn(id: string | number) { const response = await api.post(`/returns/${id}/approve`); return response.data; }
export async function processReturn(id: string | number) { const response = await api.post(`/returns/${id}/process`); return response.data; }
export async function getReturnCustomers(): Promise<PaginatedResponse<CustomerRow>> { const response = await api.get('/customers', { params: { per_page: 100 } }); return response.data; }
export async function getReturnSuppliers(): Promise<PaginatedResponse<SupplierRow>> { const response = await api.get('/suppliers', { params: { per_page: 100 } }); return response.data; }
export async function getReturnProducts(): Promise<PaginatedResponse<ProductRow>> { const response = await api.get('/products', { params: { per_page: 100, active: 1 } }); return response.data; }
export async function getReturnWarehouses(): Promise<PaginatedResponse<WarehouseRow>> { const response = await api.get('/warehouses', { params: { per_page: 100 } }); return response.data; }
