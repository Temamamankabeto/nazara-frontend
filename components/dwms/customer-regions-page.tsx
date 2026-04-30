'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCustomerRegionsQuery } from '@/queries/customer.queries';

function money(value: number | string | null | undefined) {
  return `${Number(value ?? 0).toLocaleString()} ETB`;
}

export default function CustomerRegionsPage() {
  const regionsQuery = useCustomerRegionsQuery();
  const rows = regionsQuery.data ?? [];
  const totalCustomers = rows.reduce((sum, row) => sum + row.total_customers, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Button variant="outline" size="icon" asChild><Link href="/customers"><ArrowLeft className="h-4 w-4" /></Link></Button><div><h1 className="text-2xl font-semibold">Customer Regions</h1><p className="text-sm text-muted-foreground">Manage and review customer distribution by sales region.</p></div></div>
      <div className="grid gap-4 md:grid-cols-3"><Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" /> Regions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{rows.length}</div></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm">Customers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalCustomers}</div></CardContent></Card><Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active customers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{rows.reduce((sum, row) => sum + row.active_customers, 0)}</div></CardContent></Card></div>
      <Card><CardHeader><CardTitle>Region summary</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Region</TableHead><TableHead>Total customers</TableHead><TableHead>Active customers</TableHead><TableHead>Credit limit</TableHead><TableHead>Balance</TableHead></TableRow></TableHeader><TableBody>{regionsQuery.isLoading ? <TableRow><TableCell colSpan={5}>Loading regions...</TableCell></TableRow> : rows.length === 0 ? <TableRow><TableCell colSpan={5}>No customer regions found.</TableCell></TableRow> : rows.map((row) => <TableRow key={row.region}><TableCell className="font-medium">{row.region}</TableCell><TableCell>{row.total_customers}</TableCell><TableCell>{row.active_customers}</TableCell><TableCell>{money(row.credit_limit)}</TableCell><TableCell>{money(row.balance)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    </div>
  );
}
