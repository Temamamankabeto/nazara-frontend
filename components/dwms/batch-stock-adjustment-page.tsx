'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useProductsQuery } from '@/queries/product.queries';
import { useWarehousesQuery } from '@/queries/warehouse.queries';
import { useCreateBatchStockAdjustmentMutation } from '@/hooks/use-inventory';

type Row = { product_id: string; warehouse_id: string; quantity: string; unit_cost: string; reason: string; notes: string };
const emptyRow: Row = { product_id: '', warehouse_id: '', quantity: '', unit_cost: '', reason: '', notes: '' };

export default function BatchStockAdjustmentPage() {
  const [globalReason, setGlobalReason] = useState('Batch inventory correction');
  const [rows, setRows] = useState<Row[]>([{ ...emptyRow }]);
  const productsQuery = useProductsQuery({ per_page: 100, active: '1' });
  const warehousesQuery = useWarehousesQuery({ per_page: 100 });
  const mutation = useCreateBatchStockAdjustmentMutation();

  const products = productsQuery.data?.data ?? [];
  const warehouses = warehousesQuery.data?.data ?? [];

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((current) => current.map((row, i) => i === index ? { ...row, ...patch } : row));
  }

  function addRow() { setRows((current) => [...current, { ...emptyRow }]); }
  function removeRow(index: number) { setRows((current) => current.length === 1 ? current : current.filter((_, i) => i !== index)); }

  async function submit() {
    const adjustments = rows.filter((row) => row.product_id && row.warehouse_id && Number(row.quantity) !== 0).map((row) => ({
      product_id: Number(row.product_id),
      warehouse_id: Number(row.warehouse_id),
      quantity: Number(row.quantity),
      unit_cost: row.unit_cost ? Number(row.unit_cost) : null,
      reason: row.reason || globalReason || 'Batch inventory correction',
      notes: row.notes || null,
      movement_type: 'adjustment' as const,
    }));

    if (adjustments.length === 0) {
      toast.error('Add at least one valid adjustment row.');
      return;
    }

    try {
      await mutation.mutateAsync({ global_reason: globalReason, adjustments });
      toast.success('Batch stock adjustment saved');
      setRows([{ ...emptyRow }]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Failed to save batch adjustment.');
    }
  }

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-semibold">Batch Stock Adjustment</h1><p className="text-sm text-muted-foreground">Adjust multiple products in one backend transaction.</p></div>
    <Card>
      <CardHeader><CardTitle>Adjustment rows</CardTitle><CardDescription>Use positive quantity to add stock and negative quantity to reduce stock.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2"><Label>Global reason</Label><Input value={globalReason} onChange={(e) => setGlobalReason(e.target.value)} /></div>
        <div className="space-y-4">
          {rows.map((row, index) => <div key={index} className="rounded-xl border p-4 space-y-4">
            <div className="flex items-center justify-between"><h3 className="font-medium">Row {index + 1}</h3><Button variant="ghost" size="icon" onClick={() => removeRow(index)} disabled={rows.length === 1}><Trash2 className="h-4 w-4" /></Button></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2"><Label>Product *</Label><Select value={row.product_id} onValueChange={(value) => updateRow(index, { product_id: value })}><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger><SelectContent>{products.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.sku})</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Warehouse *</Label><Select value={row.warehouse_id} onValueChange={(value) => updateRow(index, { warehouse_id: value })}><SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger><SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Quantity *</Label><Input type="number" step="0.001" value={row.quantity} onChange={(e) => updateRow(index, { quantity: e.target.value })} placeholder="Example: 10 or -5" /></div>
              <div className="space-y-2"><Label>Unit cost</Label><Input type="number" step="0.01" value={row.unit_cost} onChange={(e) => updateRow(index, { unit_cost: e.target.value })} /></div>
              <div className="space-y-2 lg:col-span-2"><Label>Reason</Label><Input value={row.reason} onChange={(e) => updateRow(index, { reason: e.target.value })} placeholder="Optional, global reason used if empty" /></div>
              <div className="space-y-2 md:col-span-2 lg:col-span-3"><Label>Notes</Label><Textarea value={row.notes} onChange={(e) => updateRow(index, { notes: e.target.value })} /></div>
            </div>
          </div>)}
        </div>
        <div className="flex flex-col gap-2 md:flex-row"><Button variant="outline" onClick={addRow}><Plus className="mr-2 h-4 w-4" /> Add row</Button><Button onClick={submit} disabled={mutation.isPending}><RefreshCcw className="mr-2 h-4 w-4" /> Save batch adjustment</Button></div>
      </CardContent>
    </Card>
  </div>;
}
