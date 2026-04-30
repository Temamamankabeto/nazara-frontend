import api from '@/lib/axios';
import type { PaginatedResponse as InvoicePaginatedResponse, InvoiceRow } from '@/types/invoice.types';
import type { PaginatedResponse, PaymentFilters, PaymentFormPayload, PaymentRow } from '@/types/payment.types';

function cleanFilters(filters: PaymentFilters) {
  const params: Record<string, unknown> = { ...filters };
  if (!params.method || params.method === 'all') delete params.method;
  if (!params.status || params.status === 'all') delete params.status;
  if (!params.branch_id || params.branch_id === 'all') delete params.branch_id;
  return params;
}

export async function getPayments(params: PaymentFilters = {}): Promise<PaginatedResponse<PaymentRow>> {
  const response = await api.get('/payments', { params: cleanFilters(params) });
  return response.data;
}

export async function createPayment(payload: PaymentFormPayload) {
  if (payload.receipt) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') formData.append(key, value as Blob | string);
    });
    const response = await api.post('/payments', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  }
  const { receipt, ...jsonPayload } = payload;
  const response = await api.post('/payments', jsonPayload);
  return response.data;
}

export async function getOpenInvoices(): Promise<InvoicePaginatedResponse<InvoiceRow>> {
  const response = await api.get('/invoices', { params: { per_page: 100 } });
  return response.data;
}
export async function openPaymentReceipt(id: string | number) {
  const response = await api.get(`/payments/${id}/receipt`, {
    responseType: 'blob',
  });

  const blobUrl = window.URL.createObjectURL(response.data);
  window.open(blobUrl, '_blank');
}

export function getPaymentReceiptUrl(id: string | number) {
  return `${process.env.NEXT_PUBLIC_API_URL}/payments/${id}/receipt`;
}
