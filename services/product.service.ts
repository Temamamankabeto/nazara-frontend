import api from '@/lib/axios';
import type { PaginatedResponse, ProductFilters, ProductFormPayload, ProductRow, SupplierLite } from '@/types/product.types';

function cleanFilters(filters: ProductFilters = {}) {
  const params: Record<string, unknown> = { ...filters };
  if (params.active === 'all') delete params.active;
  if (!params.product_category_id || params.product_category_id === 'all') delete params.product_category_id;
  if (!params.supplier_id || params.supplier_id === 'all') delete params.supplier_id;
  return params;
}

export async function getProducts(params: ProductFilters = {}): Promise<PaginatedResponse<ProductRow>> {
  const response = await api.get('/products', { params: cleanFilters(params) });
  return response.data;
}

export async function createProduct(payload: ProductFormPayload) {
  const response = await api.post('/products', payload);
  return response.data;
}

export async function updateProduct(id: string | number, payload: ProductFormPayload) {
  const response = await api.put(`/products/${id}`, payload);
  return response.data;
}

export async function toggleProductStatus(id: string | number) {
  const response = await api.patch(`/products/${id}/toggle`);
  return response.data;
}

export async function deleteProduct(id: string | number) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}

export async function getSuppliersLite(): Promise<PaginatedResponse<SupplierLite>> {
  const response = await api.get('/suppliers', { params: { per_page: 100, active: '1' } });
  return response.data;
}
