'use client';

import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLowStockAlertsQuery } from '@/queries/inventory.queries';

function n(value: unknown) { return Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 }); }

export default function InventoryAlertsPage() {
  const query = useLowStockAlertsQuery();
  const rows = query.data?.data ?? [];
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold">Stock Alerts</h1><p className="text-sm text-muted-foreground">Low-stock alerts generated from reorder levels using backend /reports/low-stock.</p></div><Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Low stock products</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Current stock</TableHead><TableHead className="text-right">Reorder level</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{query.isLoading ? <TableRow><TableCell colSpan={5}>Loading alerts...</TableCell></TableRow> : rows.length === 0 ? <TableRow><TableCell colSpan={5}>No low-stock alerts found.</TableCell></TableRow> : rows.map((product) => <TableRow key={product.id}><TableCell><div className="font-medium">{product.name}</div><div className="text-xs text-muted-foreground">SKU: {product.sku}</div></TableCell><TableCell>{product.category?.name ?? product.product_category_id}</TableCell><TableCell className="text-right">{n(product.current_stock)}</TableCell><TableCell className="text-right">{n(product.reorder_level)}</TableCell><TableCell><Badge variant="destructive">Reorder required</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></div>;
}
