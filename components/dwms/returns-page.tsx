"use client";

import { useMemo, useState } from "react";
import { Plus, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useApproveReturnMutation,
  useCreateReturnMutation,
  useProcessReturnMutation,
} from "@/hooks/use-returns";
import {
  useReturnCustomersQuery,
  useReturnProductsQuery,
  useReturnsQuery,
  useReturnSuppliersQuery,
  useReturnWarehousesQuery,
} from "@/queries/returns.queries";
import {
  RETURN_STATUSES,
  RETURN_TYPES,
  type ReturnFormPayload,
  type ReturnRow,
  type ReturnType,
} from "@/types/returns.types";

type ItemForm = {
  product_id: string;
  quantity: string;
  unit_price: string;
  reason: string;
};

const initialItem: ItemForm = {
  product_id: "",
  quantity: "1",
  unit_price: "0",
  reason: "",
};

const initialForm = {
  return_type: "customer_return",
  customer_id: "",
  supplier_id: "",
  warehouse_id: "",
  return_date: new Date().toISOString().slice(0, 10),
  reason: "",
  notes: "",
  items: [{ ...initialItem }] as ItemForm[],
};

function money(value: number | string | null | undefined) {
  return `${Number(value ?? 0).toLocaleString()} ETB`;
}

function label(value: string) {
  return value.replaceAll("_", " ");
}

function statusVariant(status: string) {
  if (status === "processed") return "default";
  if (status === "approved") return "secondary";
  if (status === "cancelled") return "destructive";
  return "outline";
}

function canApprove(status: string) {
  return status === "draft" || status === "pending";
}

function canProcess(status: string) {
  return status === "approved";
}

export default function ReturnsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [returnType, setReturnType] = useState("all");
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<ReturnRow | null>(null);
  const [form, setForm] = useState(initialForm);

  const returnsQuery = useReturnsQuery({
    page,
    per_page: 10,
    status,
    return_type: returnType,
  });
  const customersQuery = useReturnCustomersQuery();
  const suppliersQuery = useReturnSuppliersQuery();
  const productsQuery = useReturnProductsQuery();
  const warehousesQuery = useReturnWarehousesQuery();

  const createMutation = useCreateReturnMutation();
  const approveMutation = useApproveReturnMutation();
  const processMutation = useProcessReturnMutation();

  const rows = returnsQuery.data?.data ?? [];
  const customers = customersQuery.data?.data ?? [];
  const suppliers = suppliersQuery.data?.data ?? [];
  const products = productsQuery.data?.data ?? [];
  const warehouses = warehousesQuery.data?.data ?? [];
  const meta = returnsQuery.data?.meta ?? {
    current_page: page,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

  const total = useMemo(
    () =>
      form.items.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0) * Number(item.unit_price || 0),
        0
      ),
    [form.items]
  );

  function updateItem(index: number, patch: Partial<ItemForm>) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function selectProduct(index: number, productId: string) {
    const product = products.find((row) => String(row.id) === productId);
    updateItem(index, {
      product_id: productId,
      unit_price: String(product?.unit_price ?? 0),
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

  async function submitReturn() {
    const cleanItems = form.items.filter(
      (item) => item.product_id && Number(item.quantity) > 0
    );

    if (!form.warehouse_id || cleanItems.length === 0) {
      toast.error("Select a warehouse and at least one product.");
      return;
    }

    if (form.return_type === "customer_return" && !form.customer_id) {
      toast.error("Customer is required for customer returns.");
      return;
    }

    if (form.return_type === "supplier_return" && !form.supplier_id) {
      toast.error("Supplier is required for supplier returns.");
      return;
    }

    const payload: ReturnFormPayload = {
      return_type: form.return_type as ReturnType,
      customer_id: form.customer_id ? Number(form.customer_id) : null,
      supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
      warehouse_id: Number(form.warehouse_id),
      return_date: form.return_date,
      reason: form.reason || null,
      notes: form.notes || null,
      items: cleanItems.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price || 0),
        reason: item.reason || null,
      })),
    };

    try {
      await createMutation.mutateAsync(payload);
      toast.success("Return transaction registered.");
      setOpen(false);
      setForm(initialForm);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Could not create return."
      );
    }
  }

  async function approve(row: ReturnRow) {
    try {
      await approveMutation.mutateAsync(row.id);
      toast.success("Return approved.");
      if (detail?.id === row.id) setDetail(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Could not approve return."
      );
    }
  }

  async function processReturn(row: ReturnRow) {
    if (
      !window.confirm(
        "Process this return? Stock and customer/supplier balances will be adjusted."
      )
    ) {
      return;
    }

    try {
      await processMutation.mutateAsync(row.id);
      toast.success("Return processed successfully.");
      if (detail?.id === row.id) setDetail(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Could not process return."
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Returns Management</h1>
          <p className="text-sm text-muted-foreground">
            Sales Officers can create, approve, process, and view return
            transactions.
          </p>
        </div>

        <Button
          onClick={() => {
            setForm(initialForm);
            setOpen(true);
          }}
        >
          Create return
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <RefreshCcw className="h-4 w-4" />
              Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meta.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                rows.filter((row) =>
                  ["draft", "pending"].includes(String(row.status))
                ).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rows.filter((row) => row.status === "processed").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Value on page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {money(
                rows.reduce(
                  (sum, row) => sum + Number(row.total_amount ?? 0),
                  0
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Return history</CardTitle>

          <div className="grid gap-3 md:grid-cols-2">
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
                {RETURN_STATUSES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={returnType}
              onValueChange={(value) => {
                setPage(1);
                setReturnType(value);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All return types</SelectItem>
                {RETURN_TYPES.map((item) => (
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
                <TableHead>Return</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {returnsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={8}>Loading returns...</TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>No returns found.</TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">
                        {row.return_number ?? `RET-${row.id}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Items: {row.items?.length ?? 0}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {label(String(row.return_type))}
                    </TableCell>
                    <TableCell>
                      {row.customer?.name ??
                        row.supplier?.name ??
                        "Internal stock issue"}
                    </TableCell>
                    <TableCell>
                      {row.warehouse?.name ?? row.warehouse_id}
                    </TableCell>
                    <TableCell>{row.return_date}</TableCell>
                    <TableCell>{money(row.total_amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariant(String(row.status)) as any}
                        className="capitalize"
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDetail(row)}
                        >
                          View
                        </Button>

                        {canApprove(String(row.status)) ? (
                          <Button
                            size="sm"
                            disabled={approveMutation.isPending}
                            onClick={() => approve(row)}
                          >
                            Approve
                          </Button>
                        ) : null}

                        {canProcess(String(row.status)) ? (
                          <Button
                            size="sm"
                            disabled={processMutation.isPending}
                            onClick={() => processReturn(row)}
                          >
                            Process
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
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-5xl overflow-x-hidden overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create return transaction</DialogTitle>
          </DialogHeader>

          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label>Return type</Label>
              <Select
                value={form.return_type}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    return_type: value,
                    customer_id: "",
                    supplier_id: "",
                  }))
                }
              >
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RETURN_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-0 space-y-2">
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
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Warehouse" />
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
            </div>

            {form.return_type === "customer_return" ? (
              <div className="min-w-0 space-y-2">
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
                  <SelectTrigger className="w-full min-w-0">
                    <SelectValue placeholder="Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem
                        key={customer.id}
                        value={String(customer.id)}
                      >
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {form.return_type === "supplier_return" ? (
              <div className="min-w-0 space-y-2">
                <Label>Supplier</Label>
                <Select
                  value={form.supplier_id}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      supplier_id: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full min-w-0">
                    <SelectValue placeholder="Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem
                        key={supplier.id}
                        value={String(supplier.id)}
                      >
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="min-w-0 space-y-2">
              <Label>Return date</Label>
              <Input
                type="date"
                value={form.return_date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    return_date: event.target.value,
                  }))
                }
              />
            </div>

            <div className="min-w-0 space-y-2 md:col-span-2">
              <Label>Reason</Label>
              <Input
                value={form.reason}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
                placeholder="Damaged package, expired, wrong delivery..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
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
                className="grid min-w-0 gap-3 rounded-lg border p-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_120px_140px_minmax(0,1fr)_auto]"
              >
                <Select
                  value={item.product_id}
                  onValueChange={(value) => selectProduct(index, value)}
                >
                  <SelectTrigger className="w-full min-w-0">
                    <SelectValue placeholder="Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem
                        key={product.id}
                        value={String(product.id)}
                      >
                        {product.name} ({product.sku})
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
                    updateItem(index, { quantity: event.target.value })
                  }
                  placeholder="Quantity"
                />

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(event) =>
                    updateItem(index, { unit_price: event.target.value })
                  }
                  placeholder="Unit price"
                />

                <Input
                  value={item.reason}
                  onChange={(event) =>
                    updateItem(index, { reason: event.target.value })
                  }
                  placeholder="Item reason"
                />

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

          <div className="rounded-lg border p-3 text-right font-semibold">
            Return value: {money(total)}
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
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitReturn}
              disabled={createMutation.isPending}
            >
              Save return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(detail)}
        onOpenChange={(value) => !value && setDetail(null)}
      >
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl overflow-x-hidden overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Return details</DialogTitle>
          </DialogHeader>

          {detail ? (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Return:</span>{" "}
                  {detail.return_number ?? detail.id}
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  {detail.status}
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  {label(String(detail.return_type))}
                </div>
                <div>
                  <span className="text-muted-foreground">Party:</span>{" "}
                  {detail.customer?.name ??
                    detail.supplier?.name ??
                    "Internal"}
                </div>
              </div>

              <div className="space-y-3">
                {(detail.items ?? []).map((item, index) => (
                  <div
                    key={item.id ?? index}
                    className="grid gap-2 rounded-lg border p-3 text-sm sm:grid-cols-2"
                  >
                    <div className="font-medium sm:col-span-2">
                      {item.product?.name ?? item.product_id}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>{" "}
                      {item.quantity}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Unit price:</span>{" "}
                      {money(item.unit_price)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>{" "}
                      {money(
                        item.line_total ??
                          Number(item.quantity) *
                            Number(item.unit_price ?? 0)
                      )}
                    </div>
                    <div className="break-words">
                      <span className="text-muted-foreground">Reason:</span>{" "}
                      {item.reason ?? "—"}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-right text-lg font-semibold">
                Total: {money(detail.total_amount)}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetail(null)}>
                  Close
                </Button>

                {canApprove(String(detail.status)) ? (
                  <Button
                    disabled={approveMutation.isPending}
                    onClick={() => approve(detail)}
                  >
                    Approve
                  </Button>
                ) : null}

                {canProcess(String(detail.status)) ? (
                  <Button
                    disabled={processMutation.isPending}
                    onClick={() => processReturn(detail)}
                  >
                    Process
                  </Button>
                ) : null}
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
