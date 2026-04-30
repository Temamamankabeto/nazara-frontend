'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  ClipboardList,
  FileText,
  Plus,
  ShieldCheck,
  Truck,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

import {
  useApproveSalesOrderMutation,
  useCreateSalesOrderMutation,
  useDispatchSalesOrderMutation,
} from '@/hooks/use-sales-orders';

import {
  useSalesOrderCustomersQuery,
  useSalesOrderProductsQuery,
  useSalesOrdersQuery,
  useSalesOrderWarehousesQuery,
} from '@/queries/sales-order.queries';

import {
  SALES_ORDER_STATUSES,
  type SalesOrderFormPayload,
  type SalesOrderRow,
} from '@/types/sales-order.types';

type OrderItemForm = {
  product_id: string;
  quantity: string;
  unit_price: string;
};

const initialItem: OrderItemForm = {
  product_id: '',
  quantity: '1',
  unit_price: '0',
};

function getInitialForm() {
  return {
    customer_id: '',
    warehouse_id: '',
    order_date: new Date().toISOString().slice(0, 10),
    delivery_date: '',
    discount: '0',
    tax: '0',
    transport_charge: '0',
    notes: '',
    items: [{ ...initialItem }] as OrderItemForm[],
  };
}

function money(value: number | string | null | undefined) {
  return `${Number(value ?? 0).toLocaleString()} ETB`;
}

function statusVariant(status: string) {
  if (status === 'pending') return 'secondary';
  if (status === 'approved') return 'default';
  if (status === 'dispatched') return 'outline';
  if (status === 'cancelled') return 'destructive';
  return 'secondary';
}

function safePrintDelivery(order: SalesOrderRow) {
  const rows = (order.items ?? [])
    .map(
      (item) => `
      <tr>
        <td>${item.product?.name ?? item.product_id}</td>
        <td>${item.quantity}</td>
        <td>${money(item.unit_price)}</td>
        <td>${money(item.line_total ?? Number(item.quantity) * Number(item.unit_price))}</td>
      </tr>
    `,
    )
    .join('');

  const html = `
    <html>
      <head>
        <title>Delivery Note</title>
        <style>
          body { font-family: Arial; padding: 28px; }
          table { width: 100%; border-collapse: collapse; }
          td, th { border: 1px solid #ddd; padding: 8px; }
          h1 { margin-bottom: 0; }
          .muted { color: #666; }
        </style>
      </head>
      <body>
        <h1>Pearl Detergent Delivery Note</h1>
        <p class="muted">Order: ${order.order_number ?? order.id}</p>
        <p>
          Customer: ${order.customer?.name ?? order.customer_id}<br/>
          Warehouse: ${order.warehouse?.name ?? order.warehouse_id}<br/>
          Delivery date: ${order.delivery_date ?? '—'}
        </p>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <h3>Total: ${money(order.total)}</h3>
        <p>
          Prepared by: ____________________ &nbsp;
          Received by: ____________________
        </p>

        <script>window.print()</script>
      </body>
    </html>
  `;

  const win = window.open('', '_blank');

  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export default function SalesOrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<SalesOrderRow | null>(null);
  const [form, setForm] = useState(getInitialForm());

  const salesOrdersQuery = useSalesOrdersQuery({
    page,
    per_page: 10,
    status,
  });

  const customersQuery = useSalesOrderCustomersQuery();
  const warehousesQuery = useSalesOrderWarehousesQuery();
  const productsQuery = useSalesOrderProductsQuery();

  const createMutation = useCreateSalesOrderMutation();
  const approveMutation = useApproveSalesOrderMutation();
  const dispatchMutation = useDispatchSalesOrderMutation();

  const rows = salesOrdersQuery.data?.data ?? [];
  const customers = customersQuery.data?.data ?? [];
  const warehouses = warehousesQuery.data?.data ?? [];
  const products = productsQuery.data?.data ?? [];

  const meta = salesOrdersQuery.data?.meta ?? {
    current_page: page,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

  const selectedCustomer = customers.find(
    (customer) => String(customer.id) === form.customer_id,
  );

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((sum, item) => {
      return sum + Number(item.quantity || 0) * Number(item.unit_price || 0);
    }, 0);

    const total =
      subtotal -
      Number(form.discount || 0) +
      Number(form.tax || 0) +
      Number(form.transport_charge || 0);

    return { subtotal, total };
  }, [form]);

  function priceFor(product: any, qty = 1) {
    const tier = (product?.wholesale_price_tiers ?? [])
      .filter((t: any) => Number(qty) >= Number(t.min_quantity ?? 0))
      .sort((a: any, b: any) => Number(b.min_quantity) - Number(a.min_quantity))[0];

    if (tier) return tier.price;

    return product?.unit_price ?? product?.price ?? 0;
  }

  function updateItem(index: number, patch: Partial<OrderItemForm>) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const nextItem = { ...item, ...patch };

        if (patch.quantity && nextItem.product_id) {
          const product = products.find(
            (row) => String(row.id) === nextItem.product_id,
          );

          nextItem.unit_price = String(
            priceFor(product, Number(nextItem.quantity || 1)),
          );
        }

        return nextItem;
      }),
    }));
  }

  function selectProduct(index: number, productId: string) {
    const product = products.find((row) => String(row.id) === productId);
    const quantity = Number(form.items[index]?.quantity ?? 1);

    updateItem(index, {
      product_id: productId,
      unit_price: String(priceFor(product, quantity)),
    });
  }

  function addItem() {
    setForm((current) => ({
      ...current,
      items: [...current.items, { ...initialItem }],
    }));
  }

  function removeItem(index: number) {
    setForm((current) => ({
      ...current,
      items:
        current.items.length <= 1
          ? current.items
          : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function submitSalesOrder() {
    const cleanItems = form.items.filter(
      (item) => item.product_id && Number(item.quantity) > 0,
    );

    if (!form.customer_id || !form.warehouse_id || cleanItems.length === 0) {
      toast.error('Select customer, warehouse, and products');
      return;
    }

    const payload: SalesOrderFormPayload = {
      customer_id: Number(form.customer_id),
      warehouse_id: Number(form.warehouse_id),
      order_date: form.order_date,
      delivery_date: form.delivery_date || null,
      discount: Number(form.discount || 0),
      tax: Number(form.tax || 0),
      transport_charge: Number(form.transport_charge || 0),
      notes: form.notes || null,
      items: cleanItems.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      })),
    };

    try {
      await createMutation.mutateAsync(payload);
      toast.success('Sales order created successfully');
      setOpen(false);
      setForm(getInitialForm());
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Could not create sales order',
      );
    }
  }

  async function approveOrder(order: SalesOrderRow) {
    try {
      await approveMutation.mutateAsync(order.id);
      toast.success('Sales order approved and ready for dispatch');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? 'Could not approve',
      );
    }
  }

  async function dispatchOrder(order: SalesOrderRow) {
    const confirmed = confirm(
      `Dispatch ${order.order_number ?? 'this order'}? Stock will be deducted and an invoice will be generated.`,
    );

    if (!confirmed) return;

    try {
      await dispatchMutation.mutateAsync(order.id);
      toast.success('Dispatched, stock deducted, and invoice generated');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? 'Could not dispatch',
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sales Orders</h1>
          <p className="text-sm text-muted-foreground">
            Wholesale order creation with customer price levels, stock availability
            validation, approval, dispatch, delivery note, and invoice generation.
          </p>
        </div>

        <Button
          onClick={() => {
            setForm(getInitialForm());
            setOpen(true);
          }}
        >
          Create sales order
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ClipboardList className="h-4 w-4" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meta.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rows.filter((row) => row.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4" />
              Dispatched
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rows.filter((row) => row.status === 'dispatched').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Page value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {money(rows.reduce((sum, row) => sum + Number(row.total ?? 0), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Sales order list</CardTitle>

          <div className="max-w-xs">
            <Select
              value={status}
              onValueChange={(value) => {
                setPage(1);
                setStatus(value);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {SALES_ORDER_STATUSES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {salesOrdersQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>Loading...</TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>No sales orders found.</TableCell>
                </TableRow>
              ) : (
                rows.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">
                        {order.order_number ?? `SO-${order.id}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Items: {order.items?.length ?? 0}
                      </div>
                    </TableCell>

                    <TableCell>
                      {order.customer?.name ?? order.customer_id}
                    </TableCell>

                    <TableCell>
                      {order.warehouse?.name ?? order.warehouse_id}
                    </TableCell>

                    <TableCell>
                      <div>{order.order_date}</div>
                      {order.delivery_date ? (
                        <div className="text-xs text-muted-foreground">
                          Delivery: {order.delivery_date}
                        </div>
                      ) : null}
                    </TableCell>

                    <TableCell>{money(order.total)}</TableCell>

                    <TableCell>
                      <Badge
                        variant={statusVariant(String(order.status)) as any}
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDetail(order)}
                        >
                          View
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => safePrintDelivery(order)}
                        >
                          <FileText className="mr-1 h-4 w-4" />
                          Delivery note
                        </Button>

                        {order.status === 'pending' ? (
                          <Button size="sm" onClick={() => approveOrder(order)}>
                            Approve
                          </Button>
                        ) : null}

                        {order.status === 'approved' ? (
                          <Button size="sm" onClick={() => dispatchOrder(order)}>
                            Dispatch
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {meta.current_page} of {meta.last_page}
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.last_page}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create wholesale sales order</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select
                  value={form.customer_id}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      customer_id: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={String(customer.id)}>
                        {customer.name} •{' '}
                        {customer.price_level ??
                          customer.customer_type ??
                          'standard'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedCustomer ? (
                  <p className="text-xs text-muted-foreground">
                    Price level: {selectedCustomer.price_level ?? 'standard'} •
                    Credit limit: {money(selectedCustomer.credit_limit)}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Warehouse</Label>
                <Select
                  value={form.warehouse_id}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      warehouse_id: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem
                        key={warehouse.id}
                        value={String(warehouse.id)}
                      >
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className="text-xs text-muted-foreground">
                  Stock availability will be checked before saving.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Order date</Label>
                <Input
                  type="date"
                  value={form.order_date}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      order_date: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Delivery date</Label>
                <Input
                  type="date"
                  value={form.delivery_date}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      delivery_date: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Items</Label>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add item
                </Button>
              </div>

              {form.items.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_120px_140px_130px_40px]"
                >
                  <Select
                    value={item.product_id}
                    onValueChange={(value) => selectProduct(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem
                          key={product.id}
                          value={String(product.id)}
                        >
                          {product.name}{' '}
                          {product.sku ? `(${product.sku})` : ''} • Stock{' '}
                          {product.current_stock ??
                            product.stock_quantity ??
                            0}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(index, {
                        quantity: event.target.value,
                      })
                    }
                    placeholder="Qty"
                  />

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(event) =>
                      updateItem(index, {
                        unit_price: event.target.value,
                      })
                    }
                    placeholder="Price"
                  />

                  <div className="flex items-center text-sm font-medium">
                    {money(
                      Number(item.quantity || 0) *
                        Number(item.unit_price || 0),
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={form.items.length === 1}
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Discount</Label>
                <Input
                  type="number"
                  value={form.discount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      discount: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Tax</Label>
                <Input
                  type="number"
                  value={form.tax}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      tax: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Transport charge</Label>
                <Input
                  type="number"
                  value={form.transport_charge}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      transport_charge: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Subtotal</div>
                <div className="font-semibold">{money(totals.subtotal)}</div>

                <div className="mt-2 text-xs text-muted-foreground">Total</div>
                <div className="text-lg font-bold">{money(totals.total)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={submitSalesOrder}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(detail)} onOpenChange={(value) => !value && setDetail(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sales order details</DialogTitle>
          </DialogHeader>

          {detail ? (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Order:</span>{' '}
                  {detail.order_number ?? detail.id}
                </div>

                <div>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  {detail.status}
                </div>

                <div>
                  <span className="text-muted-foreground">Customer:</span>{' '}
                  {detail.customer?.name ?? detail.customer_id}
                </div>

                <div>
                  <span className="text-muted-foreground">Warehouse:</span>{' '}
                  {detail.warehouse?.name ?? detail.warehouse_id}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {(detail.items ?? []).map((item, index) => (
                    <TableRow key={item.id ?? index}>
                      <TableCell>
                        {item.product?.name ?? item.product_id}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{money(item.unit_price)}</TableCell>
                      <TableCell>
                        {money(
                          item.line_total ??
                            Number(item.quantity) * Number(item.unit_price),
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="text-right text-lg font-semibold">
                Total: {money(detail.total)}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => safePrintDelivery(detail)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Print delivery note
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}