'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStockMovementsQuery } from '@/queries/inventory.queries';

function n(value: unknown) { return Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 }); }

export default function InventoryDamagedStockPage() {
  const [page] = useState(1);
  const query = useStockMovementsQuery({ movement_type: 'damage', page, per_page: 50 });
  const rows = query.data?.data ?? [];
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold">Damaged Stock</h1><p className="text-sm text-muted-foreground">Track damaged detergent stock and related warehouse reductions.</p></div>{query.isError && <Card className="border-amber-200"><CardContent className="pt-6 text-sm text-amber-700">Add GET /stock-movements?movement_type=damage in the backend to enable this page with real movement history.</CardContent></Card>}<Card><CardHeader><CardTitle>Damage movement history</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Warehouse</TableHead><TableHead className="text-right">Quantity</TableHead><TableHead>Notes</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{query.isLoading ? <TableRow><TableCell colSpan={5}>Loading damaged stock...</TableCell></TableRow> : rows.length === 0 ? <TableRow><TableCell colSpan={5}>No damaged stock movement found.</TableCell></TableRow> : rows.map((row) => <TableRow key={row.id}><TableCell>{row.product?.name ?? row.product_id}</TableCell><TableCell>{row.warehouse?.name ?? row.warehouse_id}</TableCell><TableCell className="text-right">{n(row.quantity)}</TableCell><TableCell>{row.notes ?? '—'}</TableCell><TableCell><Badge variant="destructive">Damaged</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></div>;
}
