'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useApproveStockTransferMutation, useCancelStockTransferMutation, useCompleteStockTransferMutation, useCreateStockTransferMutation } from '@/hooks/use-stock-transfers';
import { useProductsQuery } from '@/queries/product.queries';
import { useStockTransfersQuery } from '@/queries/stock-transfer.queries';
import { useWarehousesQuery } from '@/queries/warehouse.queries';
import type { StockTransferFormPayload, StockTransferRow } from '@/types/stock-transfer.types';

const today = new Date().toISOString().slice(0, 10);
const initialForm = { from_warehouse_id: '', to_warehouse_id: '', transfer_date: today, product_id: '', quantity: '1', notes: '' };

function statusVariant(status: string) {
  if (['completed', 'approved', 'in_transit'].includes(status)) return 'default';
  if (status === 'draft') return 'secondary';
  return 'outline';
}

function getFromName(row: StockTransferRow) {
  return row.fromWarehouse?.name ?? row.from_warehouse?.name ?? '—';
}

function getToName(row: StockTransferRow) {
  return row.toWarehouse?.name ?? row.to_warehouse?.name ?? '—';
}

export default function StockTransfersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const transfersQuery = useStockTransfersQuery({ page, per_page: 10, status });
  const warehousesQuery = useWarehousesQuery({ per_page: 100 });
  const productsQuery = useProductsQuery({ per_page: 100, active: '1' });
  const createMutation = useCreateStockTransferMutation();
  const approveMutation = useApproveStockTransferMutation();
  const completeMutation = useCompleteStockTransferMutation();
  const cancelMutation = useCancelStockTransferMutation();

  const rows = transfersQuery.data?.data ?? [];
  const meta = transfersQuery.data?.meta ?? { current_page: page, per_page: 10, total: 0, last_page: 1 };
  const warehouses = warehousesQuery.data?.data ?? [];
  const products = productsQuery.data?.data ?? [];
  const counts = useMemo(() => ({ draft: rows.filter((row) => row.status === 'draft').length, completed: rows.filter((row) => row.status === 'completed').length }), [rows]);

  function openCreateDialog() {
    setForm(initialForm);
    setOpen(true);
  }

  async function submitTransfer() {
    const payload: StockTransferFormPayload = {
      from_warehouse_id: Number(form.from_warehouse_id),
      to_warehouse_id: Number(form.to_warehouse_id),
      transfer_date: form.transfer_date,
      notes: form.notes || null,
      items: [{ product_id: Number(form.product_id), quantity: Number(form.quantity || 0) }],
    };

    try {
      await createMutation.mutateAsync(payload);
      toast.success('Stock transfer created successfully');
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.message ?? 'Could not create transfer');
    }
  }

  async function approveTransfer(row: StockTransferRow) {
    try {
      await approveMutation.mutateAsync(row.id);
      toast.success('Transfer approved and moved to transit');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.message ?? 'Could not approve transfer');
    }
  }

  async function completeTransfer(row: StockTransferRow) {
    try {
      await completeMutation.mutateAsync(row.id);
      toast.success('Transfer completed successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.message ?? 'Could not complete transfer');
    }
  }

  async function cancelTransfer(row: StockTransferRow) {
    try {
      await cancelMutation.mutateAsync({ id: row.id, reason: 'Cancelled from frontend' });
      toast.success('Transfer cancelled successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.message ?? 'Could not cancel transfer');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Stock Transfers</h1>
          <p className="text-sm text-muted-foreground">Move detergent stock between warehouses using the backend transfer workflow: create, approve, complete, and cancel.</p>
        </div>
        <Button onClick={openCreateDialog}>Create transfer</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><ArrowRightLeft className="h-4 w-4" /> Total transfers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{meta.total}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Draft on page</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{counts.draft}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Completed on page</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{counts.completed}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div><CardTitle>Transfer list</CardTitle><p className="text-sm text-muted-foreground">Backend endpoint: /stock-transfers.</p></div>
          <div className="max-w-xs">
            <Select value={status} onValueChange={(value) => { setPage(1); setStatus(value); }}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="in_transit">In transit</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Transfer</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Items</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {transfersQuery.isLoading ? <TableRow><TableCell colSpan={6}>Loading transfers...</TableCell></TableRow> : rows.length === 0 ? <TableRow><TableCell colSpan={6}>No transfers found.</TableCell></TableRow> : rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell><div className="font-medium">{row.transfer_number ?? `TRF-${row.id}`}</div><div className="text-xs text-muted-foreground">Date: {row.transfer_date ?? '—'}</div></TableCell>
                  <TableCell>{getFromName(row)}</TableCell>
                  <TableCell>{getToName(row)}</TableCell>
                  <TableCell>{row.items?.length ? row.items.map((item) => `${item.product?.name ?? item.product_id} × ${item.quantity}`).join(', ') : '—'}</TableCell>
                  <TableCell><Badge variant={statusVariant(row.status)}>{row.status}</Badge></TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="outline" size="sm" disabled={!['draft', 'approved'].includes(row.status) || approveMutation.isPending} onClick={() => approveTransfer(row)}>Approve</Button><Button variant="outline" size="sm" disabled={row.status !== 'in_transit' || completeMutation.isPending} onClick={() => completeTransfer(row)}>Complete</Button><Button variant="outline" size="sm" disabled={!['draft', 'approved'].includes(row.status) || cancelMutation.isPending} onClick={() => cancelTransfer(row)}>Cancel</Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground"><span>Page {meta.current_page} of {meta.last_page}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Create stock transfer</DialogTitle></DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>From warehouse</Label><Select value={form.from_warehouse_id} onValueChange={(value) => setForm((current) => ({ ...current, from_warehouse_id: value }))}><SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger><SelectContent>{warehouses.map((warehouse) => <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>To warehouse</Label><Select value={form.to_warehouse_id} onValueChange={(value) => setForm((current) => ({ ...current, to_warehouse_id: value }))}><SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger><SelectContent>{warehouses.map((warehouse) => <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Transfer date</Label><Input type="date" value={form.transfer_date} onChange={(event) => setForm((current) => ({ ...current, transfer_date: event.target.value }))} /></div>
            <div className="space-y-2"><Label>Product</Label><Select value={form.product_id} onValueChange={(value) => setForm((current) => ({ ...current, product_id: value }))}><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger><SelectContent>{products.map((product) => <SelectItem key={product.id} value={String(product.id)}>{product.name} ({product.sku})</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Quantity</Label><Input type="number" min="0.001" step="0.001" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submitTransfer} disabled={createMutation.isPending}>Create transfer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
