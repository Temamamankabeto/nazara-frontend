'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCustomerLedgerQuery, useCustomersQuery } from '@/queries/customer.queries';

function money(value: number | string | null | undefined) {
  return `${Number(value ?? 0).toLocaleString()} ETB`;
}

export default function CustomerPaymentHistoryPage() {
  const searchParams = useSearchParams();
  const [customerId, setCustomerId] = useState(searchParams.get('customer_id') ?? 'all');
  const [page, setPage] = useState(1);
  const customersQuery = useCustomersQuery({ per_page: 100 });
  const ledgerQuery = useCustomerLedgerQuery({ page, per_page: 15, customer_id: customerId === 'all' ? undefined : customerId });
  const rows = ledgerQuery.data?.data ?? [];
  const meta = ledgerQuery.data?.meta ?? { current_page: page, last_page: 1, per_page: 15, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Button variant="outline" size="icon" asChild><Link href="/customers"><ArrowLeft className="h-4 w-4" /></Link></Button><div><h1 className="text-2xl font-semibold">Customer Payment History</h1><p className="text-sm text-muted-foreground">Ledger history from invoices, payments, and balance movements.</p></div></div>
      <Card><CardHeader><CardTitle>Filter history</CardTitle></CardHeader><CardContent><div className="max-w-sm"><Select value={customerId} onValueChange={(value) => { setPage(1); setCustomerId(value); }}><SelectTrigger><SelectValue placeholder="Customer" /></SelectTrigger><SelectContent><SelectItem value="all">All customers</SelectItem>{(customersQuery.data?.data ?? []).map((customer) => <SelectItem key={customer.id} value={String(customer.id)}>{customer.name}</SelectItem>)}</SelectContent></Select></div></CardContent></Card>
      <Card><CardHeader><CardTitle>Ledger entries</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Customer</TableHead><TableHead>Document</TableHead><TableHead>Type</TableHead><TableHead>Narration</TableHead><TableHead>Debit</TableHead><TableHead>Credit</TableHead><TableHead>Balance</TableHead></TableRow></TableHeader><TableBody>{ledgerQuery.isLoading ? <TableRow><TableCell colSpan={8}>Loading history...</TableCell></TableRow> : rows.length === 0 ? <TableRow><TableCell colSpan={8}>No payment history found.</TableCell></TableRow> : rows.map((row) => <TableRow key={row.id}><TableCell>{row.entry_date ?? '—'}</TableCell><TableCell>{row.customer?.name ?? row.customer_id}</TableCell><TableCell>{row.document_number ?? '—'}</TableCell><TableCell>{row.entry_type ?? row.reference_type ?? '—'}</TableCell><TableCell>{row.narration ?? '—'}</TableCell><TableCell>{money(row.debit)}</TableCell><TableCell>{money(row.credit)}</TableCell><TableCell>{money(row.balance_after)}</TableCell></TableRow>)}</TableBody></Table><div className="mt-4 flex items-center justify-between text-sm text-muted-foreground"><span>Page {meta.current_page} of {meta.last_page}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div></CardContent></Card>
    </div>
  );
}
