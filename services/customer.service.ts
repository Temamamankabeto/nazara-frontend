import api from '@/lib/axios';
import type { ApiResponse, CustomerBalanceRow, CustomerFilters, CustomerFormPayload, CustomerLedgerRow, CustomerRegionSummary, CustomerRow, LedgerFilters, PaginatedResponse } from '@/types/customer.types';

function cleanFilters(filters: Record<string, unknown>) {
  const params: Record<string, unknown> = { ...filters };
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined || params[key] === null || params[key] === '' || params[key] === 'all') delete params[key];
  });
  return params;
}

export async function getCustomers(params: CustomerFilters = {}): Promise<PaginatedResponse<CustomerRow>> {
  const response = await api.get('/customers', { params: cleanFilters(params as Record<string, unknown>) });
  return response.data;
}

export async function getCustomer(id: string | number): Promise<ApiResponse<CustomerRow>> {
  const response = await api.get(`/customers/${id}`);
  return response.data;
}

export async function createCustomer(payload: CustomerFormPayload) {
  const response = await api.post('/customers', payload);
  return response.data;
}

export async function updateCustomer(id: string | number, payload: CustomerFormPayload) {
  const response = await api.put(`/customers/${id}`, payload);
  return response.data;
}

export async function deleteCustomer(id: string | number) {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
}

export async function getCustomerLedger(params: LedgerFilters = {}): Promise<PaginatedResponse<CustomerLedgerRow>> {
  const response = await api.get('/ledgers/customers', { params: cleanFilters(params as Record<string, unknown>) });
  return response.data;
}

export async function getCustomerBalances(): Promise<ApiResponse<CustomerBalanceRow[]>> {
  const response = await api.get('/reports/customer-balances');
  return response.data;
}

export async function getCustomerRegions(): Promise<CustomerRegionSummary[]> {
  const [customersResponse, balancesResponse] = await Promise.all([
    getCustomers({ per_page: 100 }),
    getCustomerBalances().catch(() => ({ data: [] as CustomerBalanceRow[] })),
  ]);
  const balancesByCustomer = new Map((balancesResponse.data ?? []).map((row) => [String(row.customer_id), Number(row.balance ?? 0)]));
  const regions = new Map<string, CustomerRegionSummary>();
  for (const customer of customersResponse.data ?? []) {
    const region = customer.region?.trim() || 'Unassigned';
    const current = regions.get(region) ?? { region, total_customers: 0, active_customers: 0, credit_limit: 0, balance: 0 };
    current.total_customers += 1;
    if (customer.is_active) current.active_customers += 1;
    current.credit_limit += Number(customer.credit_limit ?? 0);
    current.balance += balancesByCustomer.get(String(customer.id)) ?? Number(customer.current_balance ?? customer.opening_balance ?? 0);
    regions.set(region, current);
  }
  return Array.from(regions.values()).sort((a, b) => b.total_customers - a.total_customers);
}
