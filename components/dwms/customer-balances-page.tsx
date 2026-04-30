'use client';

import Link from 'next/link';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCustomerBalancesQuery } from '@/queries/customer.queries';

function money(value: number | string | null | undefined) {
  return `${Number(value ?? 0).toLocaleString()} ETB`;
}

export default function CustomerBalancesPage() {
  const balancesQuery = useCustomerBalancesQuery();
  const rows = balancesQuery.data?.data ?? [];
  const total = rows.reduce((sum, row) => sum + Number(row.balance ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Button variant="outline" size="icon" asChild><Link href="/customers"><ArrowLeft className="h-4 w-4" /></Link></Button><div><h1 className="text-2xl font-semibold">Customer Balances</h1><p className="text-sm text-muted-foreground">Monitor distributor, retailer, supermarket, and institutional buyer outstanding balances.</p></div></div>
      <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><CreditCard className="h-4 w-4" /> Total outstanding balance</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{money(total)}</div></CardContent></Card>
      <Card><CardHeader><CardTitle>Balance report</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Category</TableHead><TableHead>Region</TableHead><TableHead>Branch</TableHead><TableHead className="text-right">Balance</TableHead></TableRow></TableHeader><TableBody>{balancesQuery.isLoading ? <TableRow><TableCell colSpan={5}>Loading balances...</TableCell></TableRow> : rows.length === 0 ? <TableRow><TableCell colSpan={5}>No balances found.</TableCell></TableRow> : rows.map((row) => <TableRow key={String(row.customer_id)}><TableCell><Button variant="link" className="px-0" asChild><Link href={`/customers/${row.customer_id}`}>{row.customer?.name ?? row.customer_id}</Link></Button></TableCell><TableCell>{row.customer?.customer_type ?? '—'}</TableCell><TableCell>{row.customer?.region ?? '—'}</TableCell><TableCell>{row.branch?.name ?? row.customer?.branch?.name ?? '—'}</TableCell><TableCell className="text-right">{money(row.balance)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    </div>
  );
}
