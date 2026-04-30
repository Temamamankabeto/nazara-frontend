'use client';

import Link from 'next/link';
import { ArrowLeft, CreditCard, FileText, MapPin, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCustomerLedgerQuery, useCustomerQuery } from '@/queries/customer.queries';
import { CUSTOMER_TYPES } from '@/types/customer.types';

function money(value: number | string | null | undefined) {
  return `${Number(value ?? 0).toLocaleString()} ETB`;
}

function typeLabel(value?: string | null) {
  return CUSTOMER_TYPES.find((type) => type.value === value)?.label ?? value ?? '—';
}

export default function CustomerDetailPage({ customerId }: { customerId: string }) {
  const customerQuery = useCustomerQuery(customerId);
  const ledgerQuery = useCustomerLedgerQuery({ customer_id: customerId, per_page: 10 });
  const customer = customerQuery.data?.data;
  const ledgerRows = ledgerQuery.data?.data ?? [];
  const currentBalance = ledgerRows[0]?.balance_after ?? customer?.opening_balance ?? 0;

  if (customerQuery.isLoading) return <div>Loading customer...</div>;
  if (!customer) return <div>Customer not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild><Link href="/customers"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <h1 className="text-2xl font-semibold">{customer.name}</h1>
            <p className="text-sm text-muted-foreground">Customer/distributor profile, balances, and payment history.</p>
          </div>
        </div>
        <Badge variant={customer.is_active ? 'default' : 'secondary'}>{customer.is_active ? 'Active' : 'Inactive'}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Category</CardTitle></CardHeader><CardContent><div className="font-semibold">{typeLabel(customer.customer_type)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Price level</CardTitle></CardHeader><CardContent><div className="font-semibold">{customer.price_level ?? 'standard'}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Credit limit</CardTitle></CardHeader><CardContent><div className="font-semibold">{money(customer.credit_limit)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Current balance</CardTitle></CardHeader><CardContent><div className="font-semibold">{money(currentBalance)}</div></CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Contact & region</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{customer.phone ?? 'No phone'}</span></div>
            <div className="flex gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span>{customer.email ?? 'No email'}</span></div>
            <div className="flex gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{customer.region ?? 'No region'}</span></div>
            <div className="rounded-xl bg-muted p-3 text-muted-foreground">{customer.address ?? 'No address recorded.'}</div>
            <div><span className="font-medium">Branch:</span> {customer.branch?.name ?? '—'}</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payment / ledger history</CardTitle><Button variant="outline" size="sm" asChild><Link href={`/customers/payment-history?customer_id=${customer.id}`}>Full history</Link></Button></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Document</TableHead><TableHead>Type</TableHead><TableHead>Debit</TableHead><TableHead>Credit</TableHead><TableHead>Balance</TableHead></TableRow></TableHeader>
              <TableBody>
                {ledgerQuery.isLoading ? <TableRow><TableCell colSpan={6}>Loading ledger...</TableCell></TableRow> : ledgerRows.length === 0 ? <TableRow><TableCell colSpan={6}>No payment or invoice history yet.</TableCell></TableRow> : ledgerRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.entry_date ?? '—'}</TableCell>
                    <TableCell>{row.document_number ?? '—'}</TableCell>
                    <TableCell>{row.entry_type ?? row.reference_type ?? '—'}</TableCell>
                    <TableCell>{money(row.debit)}</TableCell>
                    <TableCell>{money(row.credit)}</TableCell>
                    <TableCell>{money(row.balance_after)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
