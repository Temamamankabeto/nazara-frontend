'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ClipboardList, FileText, PackageCheck, Plus, Search, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useProductsQuery, useSuppliersLiteQuery } from '@/queries/product.queries';
import { usePurchaseOrdersQuery } from '@/queries/purchase.queries';
import { useWarehousesQuery } from '@/queries/warehouse.queries';
import { useCreatePurchaseOrderMutation, useReceivePurchaseOrderMutation } from '@/hooks/use-purchases';
import type { PurchaseOrderFormState, PurchaseOrderPayload, PurchaseOrderRow, ReceivePurchasePayload } from '@/types/purchase.types';

const today = new Date().toISOString().slice(0, 10);
const initialForm: PurchaseOrderFormState = {
  supplier_id: '',
  warehouse_id: '',
  order_date: today,
  expected_date: '',
  supplier_invoice_number: '',
  discount: '0',
  tax: '0',
  notes: '',
  items: [{ product_id: '', ordered_quantity: '1', unit_cost: '0' }],
};

type ReceiveForm = Record<string, string>;

function money(value: number | string | null | undefined) {
  return `${Number(value ?? 0).toLocaleString()} ETB`;
}

function qty(value: number | string | null | undefined) {
  return Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function statusBadge(status: string) {
  if (status === 'received') return 'default';
  if (status === 'partial_received') return 'secondary';
  if (status === 'cancelled') return 'destructive';
  return 'outline';
}

function statusLabel(status: string) {
  return status.replaceAll('_', ' ');
}

export default function PurchaseManagementPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [selected, setSelected] = useState<PurchaseOrderRow | null>(null);
  const [form, setForm] = useState<PurchaseOrderFormState>(initialForm);
  const [receiveForm, setReceiveForm] = useState<ReceiveForm>({});

  const purchaseQuery = usePurchaseOrdersQuery({ page, per_page: 10, status });
  const supplierQuery = useSuppliersLiteQuery();
  const warehouseQuery = useWarehousesQuery({ per_page: 100 });
  const productQuery = useProductsQuery({ per_page: 100, active: '1' });
  const createMutation = useCreatePurchaseOrderMutation();
  const receiveMutation = useReceivePurchaseOrderMutation();

  const rows = purchaseQuery.data?.data ?? [];
  const meta = purchaseQuery.data?.meta ?? { current_page: page, per_page: 10, total: 0, last_page: 1 };
  const suppliers = supplierQuery.data?.data ?? [];
  const warehouses = warehouseQuery.data?.data ?? [];
  const products = productQuery.data?.data ?? [];

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => [row.po_number, row.supplier_invoice_number, row.supplier?.name, row.warehouse?.name, row.status].some((value) => String(value ?? '').toLowerCase().includes(term)));
  }, [rows, search]);

  const stats = useMemo(() => ({
    total: meta.total,
    draft: rows.filter((row) => row.status === 'draft').length,
    partial: rows.filter((row) => row.status === 'partial_received').length,
    received: rows.filter((row) => row.status === 'received').length,
    value: rows.reduce((sum, row) => sum + Number(row.total ?? 0), 0),
  }), [rows, meta.total]);

  const formSubtotal = useMemo(() => form.items.reduce((sum, item) => sum + Number(item.ordered_quantity || 0) * Number(item.unit_cost || 0), 0), [form.items]);
  const formTotal = formSubtotal - Number(form.discount || 0) + Number(form.tax || 0);

  function resetForm() {
    setForm({ ...initialForm, order_date: today, items: [{ product_id: '', ordered_quantity: '1', unit_cost: '0' }] });
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function setItem(index: number, key: keyof PurchaseOrderFormState['items'][number], value: string) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
    }));
  }

  function addItem() {
    setForm((current) => ({ ...current, items: [...current.items, { product_id: '', ordered_quantity: '1', unit_cost: '0' }] }));
  }

  function removeItem(index: number) {
    setForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }));
  }

  async function submitPurchaseOrder() {
    if (!form.supplier_id || !form.warehouse_id) {
      toast.error('Supplier and receiving warehouse are required.');
      return;
    }
    const cleanItems = form.items.filter((item) => item.product_id && Number(item.ordered_quantity) > 0);
    if (!cleanItems.length) {
      toast.error('Add at least one product item.');
      return;
    }
    const payload: PurchaseOrderPayload = {
      supplier_id: Number(form.supplier_id),
      warehouse_id: Number(form.warehouse_id),
      order_date: form.order_date,
      expected_date: form.expected_date || null,
      supplier_invoice_number: form.supplier_invoice_number || null,
      discount: Number(form.discount || 0),
      tax: Number(form.tax || 0),
      notes: form.notes || null,
      items: cleanItems.map((item) => ({ product_id: Number(item.product_id), ordered_quantity: Number(item.ordered_quantity), unit_cost: Number(item.unit_cost || 0) })),
    };
    try {
      await createMutation.mutateAsync(payload);
      toast.success('Purchase order/request created successfully.');
      setOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to create purchase order.');
    }
  }

  function openDetails(row: PurchaseOrderRow) {
    setSelected(row);
    setDetailsOpen(true);
  }

  function openReceive(row: PurchaseOrderRow) {
    setSelected(row);
    const next: ReceiveForm = {};
    (row.items ?? []).forEach((item) => {
      const remaining = Math.max(Number(item.ordered_quantity ?? 0) - Number(item.received_quantity ?? 0), 0);
      next[String(item.id)] = remaining > 0 ? String(remaining) : '0';
    });
    setReceiveForm(next);
    setReceiveOpen(true);
  }

  async function receiveStock() {
    if (!selected) return;
    const items = (selected.items ?? [])
      .map((item) => ({ purchase_order_item_id: item.id, received_quantity: Number(receiveForm[String(item.id)] || 0) }))
      .filter((item) => item.received_quantity > 0);
    if (!items.length) {
      toast.error('Enter at least one receiving quantity.');
      return;
    }
    const payload: ReceivePurchasePayload = { items };
    try {
      await receiveMutation.mutateAsync({ id: selected.id, payload });
      toast.success('Stock received and inventory updated.');
      setReceiveOpen(false);
    } catch {
      toast.error('Failed to receive stock.');
    }
  }

  const invoiceRows = rows.filter((row) => row.supplier_invoice_number);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Management</h1>
          <p className="text-sm text-muted-foreground">Purchase Request → Purchase Order → Partial/Full Receiving → Supplier Invoice → Inventory Update → Purchase History.</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New purchase request</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><ClipboardList className="h-4 w-4" /> Total POs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Draft/request</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.draft}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Partial receiving</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.partial}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Received</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.received}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Current page value</CardTitle></CardHeader><CardContent><div className="text-xl font-bold">{money(stats.value)}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="orders">Purchase orders</TabsTrigger>
          <TabsTrigger value="receiving">Receiving</TabsTrigger>
          <TabsTrigger value="invoices">Supplier invoices</TabsTrigger>
          <TabsTrigger value="history">Purchase history</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader className="space-y-4">
              <div><CardTitle>Purchase requests and orders</CardTitle><p className="text-sm text-muted-foreground">Uses backend /purchase-orders. Backend stores new requests as draft purchase orders.</p></div>
              <div className="grid gap-2 md:grid-cols-[1fr_200px_auto]">
                <Input placeholder="Search PO, supplier invoice, supplier, warehouse" value={search} onChange={(event) => setSearch(event.target.value)} />
                <Select value={status} onValueChange={(value) => { setPage(1); setStatus(value); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="draft">Draft/request</SelectItem><SelectItem value="partial_received">Partial received</SelectItem><SelectItem value="received">Received</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select>
                <Button variant="outline"><Search className="mr-2 h-4 w-4" /> Filter</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>PO / Request</TableHead><TableHead>Supplier</TableHead><TableHead>Warehouse</TableHead><TableHead>Dates</TableHead><TableHead>Invoice</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {purchaseQuery.isLoading ? <TableRow><TableCell colSpan={8}>Loading purchase orders...</TableCell></TableRow> : filteredRows.length === 0 ? <TableRow><TableCell colSpan={8}>No purchase orders found.</TableCell></TableRow> : filteredRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell><div className="font-medium">{row.po_number}</div><div className="text-xs text-muted-foreground">{row.items?.length ?? 0} item(s)</div></TableCell>
                      <TableCell>{row.supplier?.name ?? '—'}</TableCell>
                      <TableCell>{row.warehouse?.name ?? '—'}</TableCell>
                      <TableCell><div>{row.order_date}</div><div className="text-xs text-muted-foreground">Expected: {row.expected_date ?? '—'}</div></TableCell>
                      <TableCell>{row.supplier_invoice_number ? <Badge variant="secondary">{row.supplier_invoice_number}</Badge> : 'Not recorded'}</TableCell>
                      <TableCell>{money(row.total)}</TableCell>
                      <TableCell><Badge variant={statusBadge(row.status)} className="capitalize">{statusLabel(row.status)}</Badge></TableCell>
                      <TableCell className="text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => openDetails(row)}>Details</Button>{row.status !== 'received' && <Button size="sm" onClick={() => openReceive(row)}>Receive</Button>}</div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground"><span>Page {meta.current_page} of {meta.last_page}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receiving" className="mt-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><PackageCheck className="h-5 w-5" /> Partial receiving queue</CardTitle></CardHeader><CardContent>
            <Table><TableHeader><TableRow><TableHead>PO</TableHead><TableHead>Supplier</TableHead><TableHead>Warehouse</TableHead><TableHead>Pending lines</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>
              {rows.filter((row) => row.status !== 'received').map((row) => <TableRow key={row.id}><TableCell>{row.po_number}</TableCell><TableCell>{row.supplier?.name ?? '—'}</TableCell><TableCell>{row.warehouse?.name ?? '—'}</TableCell><TableCell>{(row.items ?? []).filter((item) => Number(item.received_quantity) < Number(item.ordered_quantity)).length}</TableCell><TableCell><Badge variant={statusBadge(row.status)}>{statusLabel(row.status)}</Badge></TableCell><TableCell className="text-right"><Button size="sm" onClick={() => openReceive(row)}>Receive stock</Button></TableCell></TableRow>)}
            </TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Supplier invoices</CardTitle></CardHeader><CardContent>
            <Table><TableHeader><TableRow><TableHead>Supplier invoice</TableHead><TableHead>PO</TableHead><TableHead>Supplier</TableHead><TableHead>Date</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
              {invoiceRows.length === 0 ? <TableRow><TableCell colSpan={6}>No supplier invoices recorded yet. Add invoice number when creating the purchase request/order.</TableCell></TableRow> : invoiceRows.map((row) => <TableRow key={row.id}><TableCell>{row.supplier_invoice_number}</TableCell><TableCell>{row.po_number}</TableCell><TableCell>{row.supplier?.name ?? '—'}</TableCell><TableCell>{row.order_date}</TableCell><TableCell>{money(row.total)}</TableCell><TableCell><Badge variant={statusBadge(row.status)}>{statusLabel(row.status)}</Badge></TableCell></TableRow>)}
            </TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Purchase history</CardTitle></CardHeader><CardContent>
            <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>PO</TableHead><TableHead>Supplier</TableHead><TableHead>Warehouse</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
              {rows.map((row) => <TableRow key={row.id}><TableCell>{row.order_date}</TableCell><TableCell>{row.po_number}</TableCell><TableCell>{row.supplier?.name ?? '—'}</TableCell><TableCell>{row.warehouse?.name ?? '—'}</TableCell><TableCell>{row.items?.length ?? 0}</TableCell><TableCell>{money(row.total)}</TableCell><TableCell><Badge variant={statusBadge(row.status)}>{statusLabel(row.status)}</Badge></TableCell></TableRow>)}
            </TableBody></Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader><DialogTitle>Create purchase request / order</DialogTitle></DialogHeader>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2"><Label>Supplier</Label><Select value={form.supplier_id} onValueChange={(value) => setForm((current) => ({ ...current, supplier_id: value }))}><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger><SelectContent>{suppliers.map((supplier) => <SelectItem key={supplier.id} value={String(supplier.id)}>{supplier.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Receiving warehouse</Label><Select value={form.warehouse_id} onValueChange={(value) => setForm((current) => ({ ...current, warehouse_id: value }))}><SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger><SelectContent>{warehouses.map((warehouse) => <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Order date</Label><Input type="date" value={form.order_date} onChange={(event) => setForm((current) => ({ ...current, order_date: event.target.value }))} /></div>
            <div className="space-y-2"><Label>Expected delivery date</Label><Input type="date" value={form.expected_date} onChange={(event) => setForm((current) => ({ ...current, expected_date: event.target.value }))} /></div>
            <div className="space-y-2"><Label>Supplier invoice number</Label><Input value={form.supplier_invoice_number} onChange={(event) => setForm((current) => ({ ...current, supplier_invoice_number: event.target.value }))} placeholder="INV-0001" /></div>
            <div className="grid grid-cols-2 gap-2"><div className="space-y-2"><Label>Discount</Label><Input type="number" min="0" value={form.discount} onChange={(event) => setForm((current) => ({ ...current, discount: event.target.value }))} /></div><div className="space-y-2"><Label>Tax</Label><Input type="number" min="0" value={form.tax} onChange={(event) => setForm((current) => ({ ...current, tax: event.target.value }))} /></div></div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between"><Label>Purchase items</Label><Button type="button" variant="outline" size="sm" onClick={addItem}>Add item</Button></div>
            {form.items.map((item, index) => (
              <div key={index} className="grid gap-2 rounded-xl border p-3 md:grid-cols-[1fr_140px_160px_120px]">
                <Select value={item.product_id} onValueChange={(value) => setItem(index, 'product_id', value)}><SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger><SelectContent>{products.map((product) => <SelectItem key={product.id} value={String(product.id)}>{product.name} {product.sku ? `(${product.sku})` : ''}</SelectItem>)}</SelectContent></Select>
                <Input type="number" min="0.001" step="0.001" placeholder="Qty" value={item.ordered_quantity} onChange={(event) => setItem(index, 'ordered_quantity', event.target.value)} />
                <Input type="number" min="0" step="0.01" placeholder="Unit cost" value={item.unit_cost} onChange={(event) => setItem(index, 'unit_cost', event.target.value)} />
                <Button type="button" variant="outline" disabled={form.items.length === 1} onClick={() => removeItem(index)}>Remove</Button>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_260px]">
            <div className="space-y-2"><Label>Notes / request justification</Label><Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Reason for purchase, delivery instructions, agreement note..." /></div>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Order summary</CardTitle></CardHeader><CardContent className="space-y-1 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{money(formSubtotal)}</span></div><div className="flex justify-between"><span>Discount</span><span>{money(form.discount)}</span></div><div className="flex justify-between"><span>Tax</span><span>{money(form.tax)}</span></div><div className="flex justify-between border-t pt-2 font-semibold"><span>Total</span><span>{money(formTotal)}</span></div></CardContent></Card>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submitPurchaseOrder} disabled={createMutation.isPending}>{createMutation.isPending ? 'Saving...' : 'Create purchase order'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader><DialogTitle>{selected?.po_number ?? 'Purchase order'} details</DialogTitle></DialogHeader>
          <div className="grid gap-3 text-sm md:grid-cols-3">
            <div><span className="text-muted-foreground">Supplier:</span> {selected?.supplier?.name ?? '—'}</div><div><span className="text-muted-foreground">Warehouse:</span> {selected?.warehouse?.name ?? '—'}</div><div><span className="text-muted-foreground">Status:</span> {selected?.status ? statusLabel(selected.status) : '—'}</div><div><span className="text-muted-foreground">Order date:</span> {selected?.order_date ?? '—'}</div><div><span className="text-muted-foreground">Expected:</span> {selected?.expected_date ?? '—'}</div><div><span className="text-muted-foreground">Supplier invoice:</span> {selected?.supplier_invoice_number ?? '—'}</div>
          </div>
          <Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Ordered</TableHead><TableHead>Received</TableHead><TableHead>Remaining</TableHead><TableHead>Unit cost</TableHead><TableHead>Total</TableHead></TableRow></TableHeader><TableBody>{(selected?.items ?? []).map((item) => <TableRow key={item.id}><TableCell>{item.product?.name ?? item.product_id}</TableCell><TableCell>{qty(item.ordered_quantity)}</TableCell><TableCell>{qty(item.received_quantity)}</TableCell><TableCell>{qty(Number(item.ordered_quantity) - Number(item.received_quantity))}</TableCell><TableCell>{money(item.unit_cost)}</TableCell><TableCell>{money(item.line_total)}</TableCell></TableRow>)}</TableBody></Table>
          <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">{selected?.notes || 'No notes recorded.'}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Receive stock for {selected?.po_number}</DialogTitle></DialogHeader>
          <Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Ordered</TableHead><TableHead>Received</TableHead><TableHead>Remaining</TableHead><TableHead>Receive now</TableHead></TableRow></TableHeader><TableBody>{(selected?.items ?? []).map((item) => { const remaining = Math.max(Number(item.ordered_quantity) - Number(item.received_quantity), 0); return <TableRow key={item.id}><TableCell>{item.product?.name ?? item.product_id}</TableCell><TableCell>{qty(item.ordered_quantity)}</TableCell><TableCell>{qty(item.received_quantity)}</TableCell><TableCell>{qty(remaining)}</TableCell><TableCell><Input type="number" min="0" max={remaining} step="0.001" value={receiveForm[String(item.id)] ?? '0'} onChange={(event) => setReceiveForm((current) => ({ ...current, [String(item.id)]: event.target.value }))} /></TableCell></TableRow>; })}</TableBody></Table>
          <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">Receiving calls backend /purchase-orders/{selected?.id}/receive and your backend InventoryService creates purchase stock movements automatically.</div>
          <DialogFooter><Button variant="outline" onClick={() => setReceiveOpen(false)}>Cancel</Button><Button onClick={receiveStock} disabled={receiveMutation.isPending}>{receiveMutation.isPending ? 'Receiving...' : 'Receive stock'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
