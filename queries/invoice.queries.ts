import { useQuery } from '@tanstack/react-query';
import { getInvoice, getInvoices, getOutstandingInvoices } from '@/services/invoice.service';
import type { InvoiceFilters } from '@/types/invoice.types';

export const invoiceKeys = { all: ['invoices'] as const, list: (filters: InvoiceFilters) => [...invoiceKeys.all, 'list', filters] as const, detail: (id: string | number) => [...invoiceKeys.all, 'detail', id] as const, outstanding: () => [...invoiceKeys.all, 'outstanding'] as const };
export function useInvoicesQuery(filters: InvoiceFilters = {}) { return useQuery({ queryKey: invoiceKeys.list(filters), queryFn: () => getInvoices(filters) }); }
export function useInvoiceQuery(id: string | number, enabled = true) { return useQuery({ queryKey: invoiceKeys.detail(id), queryFn: () => getInvoice(id), enabled: Boolean(id) && enabled }); }
export function useOutstandingInvoicesQuery() { return useQuery({ queryKey: invoiceKeys.outstanding(), queryFn: getOutstandingInvoices }); }
