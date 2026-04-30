'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateStockAdjustmentMutation } from '@/hooks/use-inventory';
import { useProductsQuery } from '@/queries/product.queries';
import { useWarehousesQuery } from '@/queries/warehouse.queries';

const initial = { product_id: '', warehouse_id: '', movement_type: 'adjustment', quantity: '', unit_cost: '', reason: '', notes: '' };

export default function InventoryAdjustmentsPage() {
  const [form, setForm] = useState(initial);
  const productsQuery = useProductsQuery({ per_page: 100, active: '1' });
  const warehousesQuery = useWarehousesQuery({ per_page: 100 });
  const mutation = useCreateStockAdjustmentMutation();

  async function submit() {
    try {
      await mutation.mutateAsync({ product_id: Number(form.product_id), warehouse_id: Number(form.warehouse_id), movement_type: form.movement_type as 'adjustment' | 'damage', quantity: Number(form.quantity), unit_cost: form.unit_cost ? Number(form.unit_cost) : null, reason: form.reason || 'Manual stock adjustment', notes: form.notes || null });
      toast.success('Stock movement recorded');
      setForm(initial);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Your backend needs POST /stock-movements to save adjustments.');
    }
  }

  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold">Stock Adjustments</h1><p className="text-sm text-muted-foreground">Record manual stock corrections and damaged stock movements.</p></div><Card><CardHeader><CardTitle>Adjustment form</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Product</Label><Select value={form.product_id} onValueChange={(value) => setForm((c) => ({ ...c, product_id: value }))}><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger><SelectContent>{(productsQuery.data?.data ?? []).map((product) => <SelectItem key={product.id} value={String(product.id)}>{product.name} ({product.sku})</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Warehouse</Label><Select value={form.warehouse_id} onValueChange={(value) => setForm((c) => ({ ...c, warehouse_id: value }))}><SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger><SelectContent>{(warehousesQuery.data?.data ?? []).map((warehouse) => <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Movement type</Label><Select value={form.movement_type} onValueChange={(value) => setForm((c) => ({ ...c, movement_type: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="adjustment">Adjustment</SelectItem><SelectItem value="damage">Damage</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Quantity</Label><Input type="number" step="0.001" value={form.quantity} onChange={(e) => setForm((c) => ({ ...c, quantity: e.target.value }))} placeholder="Use negative value to reduce stock" /></div><div className="space-y-2"><Label>Unit cost</Label><Input type="number" step="0.01" value={form.unit_cost} onChange={(e) => setForm((c) => ({ ...c, unit_cost: e.target.value }))} /></div><div className="space-y-2 md:col-span-2"><Label>Reason *</Label><Input value={form.reason} onChange={(e) => setForm((c) => ({ ...c, reason: e.target.value }))} placeholder="Reason for adjustment" /></div><div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} placeholder="Reason for adjustment" /></div></div><Button onClick={submit} disabled={!form.product_id || !form.warehouse_id || !form.quantity || mutation.isPending}>Save adjustment</Button><p className="text-xs text-muted-foreground">Connected to backend POST /stock-adjustments and POST /damaged-stock.</p></CardContent></Card></div>;
}
