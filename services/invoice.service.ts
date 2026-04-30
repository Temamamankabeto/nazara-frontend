import api from '@/lib/axios';
import type { InvoiceFilters, InvoiceRow, PaginatedResponse } from '@/types/invoice.types';

function cleanFilters(filters: InvoiceFilters) {
  const params: Record<string, unknown> = { ...filters };
  if (!params.status || params.status === 'all') delete params.status;
  if (!params.branch_id || params.branch_id === 'all') delete params.branch_id;
  return params;
}

export async function getInvoices(params: InvoiceFilters = {}): Promise<PaginatedResponse<InvoiceRow>> {
  const response = await api.get('/invoices', { params: cleanFilters(params) });
  return response.data;
}
export async function getInvoice(id: string | number) { const response = await api.get(`/invoices/${id}`); return response.data; }
export async function getOutstandingInvoices(): Promise<PaginatedResponse<InvoiceRow>> { const response = await api.get('/reports/outstanding-invoices', { params: { per_page: 100 } }); return response.data; }
export function getInvoicePrintUrl(id: string | number) { return `${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}/print`; }
export function getInvoicePdfUrl(id: string | number) { return getInvoicePrintUrl(id); }
