import { useQuery } from '@tanstack/react-query';
import { getOpenInvoices, getPayments } from '@/services/payment.service';
import type { PaymentFilters } from '@/types/payment.types';

export const paymentKeys = {
  all: ['payments'] as const,
  list: (filters: PaymentFilters) => [...paymentKeys.all, 'list', filters] as const,
  invoices: () => [...paymentKeys.all, 'open-invoices'] as const,
};

export function usePaymentsQuery(filters: PaymentFilters = {}) {
  return useQuery({ queryKey: paymentKeys.list(filters), queryFn: () => getPayments(filters) });
}

export function usePaymentInvoicesQuery() {
  return useQuery({ queryKey: paymentKeys.invoices(), queryFn: getOpenInvoices });
}
