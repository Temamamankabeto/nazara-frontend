"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  CheckCircle,
  Eye,
  Loader2,
  MoreVertical,
  Package,
  PackageCheck,
  RefreshCcw,
  Search,
  Trash2,
  Warehouse,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { useCreateStockAdjustmentMutation } from "@/hooks/use-inventory";
import {
  useLowStockAlertsQuery,
  useStockBalanceQuery,
  useStockMovementsQuery,
} from "@/queries/inventory.queries";
import { useWarehousesQuery } from "@/queries/warehouse.queries";
import type {
  LowStockRow,
  StockBalanceRow,
  StockMovementRow,
  StockMovementType,
} from "@/types/inventory.types";

const adjustmentInitial = {
  product_id: "",
  warehouse_id: "",
  movement_type: "adjustment" as "adjustment" | "damage",
  quantity: "",
  reason: "",
};

function numberValue(value: unknown) {
  return Number(value ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 3,
  });
}

function money(value: unknown) {
  return `${Number(value ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} ETB`;
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function titleCase(value?: string | null) {
  return value
    ? value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "—";
}

function getCategoryName(row: any) {
  return row.category?.name ?? row.product?.category?.name ?? "—";
}

function getProductName(row: any) {
  return (
    row.name ?? row.product?.name ?? `Product #${row.product_id ?? row.id}`
  );
}

function getProductId(row: any) {
  return Number(row.product_id ?? row.id ?? row.product?.id);
}

function getWarehouseName(movement: any) {
  return movement?.warehouse?.name ?? movement?.warehouse_name ?? "—";
}

export default function InventoryCenterPage() {
  const [page, setPage] = useState(1);
  const [warehouseId, setWarehouseId] = useState<number | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState(adjustmentInitial);
  const [selectedProductRow, setSelectedProductRow] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [lowStockPopupOpen, setLowStockPopupOpen] = useState(false);

  const warehousesQuery = useWarehousesQuery({ per_page: 100 });
  const warehouses = warehousesQuery.data?.data ?? [];

  const balanceQuery = useStockBalanceQuery({
    warehouse_id: warehouseId,
    page,
    per_page: 10,
  });

  const lowStockQuery = useLowStockAlertsQuery({
    warehouse_id: warehouseId === "all" ? undefined : warehouseId,
    per_page: 100,
  });

  const movementsQuery = useStockMovementsQuery({
    warehouse_id: warehouseId === "all" ? undefined : warehouseId,
    per_page: 100,
  });

  const adjustmentMutation = useCreateStockAdjustmentMutation();

  const inventoryRows = balanceQuery.data?.data ?? [];
  const movementRows = movementsQuery.data?.data ?? [];
  const lowRows = lowStockQuery.data?.data ?? [];
  const meta = balanceQuery.data?.meta ?? {
    current_page: page,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

  const productInventoryRows = useMemo(() => {
    const processed = inventoryRows.map((row: StockBalanceRow) => {
      const productId = getProductId(row);
      const productMovements = movementRows
        .filter(
          (movement: StockMovementRow) =>
            Number(movement.product_id) === productId,
        )
        .sort(
          (a: StockMovementRow, b: StockMovementRow) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime(),
        );
      const adjustments = productMovements.filter(
        (movement: StockMovementRow) =>
          ["adjustment", "damage", "return"].includes(movement.movement_type),
      );
      const balance = Number(row.stock_balance ?? 0);
      const reorderLevel = Number(
        row.reorder_level ?? row.product?.reorder_level ?? 0,
      );
      const lastMovement = productMovements[0] ?? null;

      return {
        ...row,
        product_id: productId,
        product_name: getProductName(row),
        category_name: getCategoryName(row),
        sku: row.sku ?? row.product?.sku ?? "—",
        barcode: row.barcode ?? row.product?.barcode ?? null,
        unit_of_measure:
          row.unit_of_measure ?? row.product?.unit_of_measure ?? "unit",
        supplier_name: row.supplier?.name ?? row.product?.supplier?.name ?? "—",
        balance,
        reorder_level: reorderLevel,
        stock_value: Number(row.stock_value ?? 0),
        last_unit_cost: row.last_unit_cost ?? null,
        movements_count: Number(row.movements_count ?? productMovements.length),
        adjustments_count: Number(row.adjustments_count ?? adjustments.length),
        last_movement_type:
          row.last_movement_type ?? lastMovement?.movement_type ?? null,
        last_movement_at:
          row.last_movement_at ?? lastMovement?.created_at ?? null,
        movements: productMovements,
        adjustments,
        is_low: reorderLevel > 0 && balance <= reorderLevel,
      };
    });

    if (!searchTerm) return processed;

    const term = searchTerm.toLowerCase();
    return processed.filter(
      (row) =>
        row.product_name.toLowerCase().includes(term) ||
        row.sku.toLowerCase().includes(term) ||
        row.category_name.toLowerCase().includes(term),
    );
  }, [inventoryRows, movementRows, searchTerm]);

  const lowStockRows = useMemo(() => {
    if (lowRows.length > 0) {
      return lowRows.map((row: LowStockRow) => ({
        ...row,
        product_id: getProductId(row),
        product_name: getProductName(row),
        category_name: getCategoryName(row),
        sku: row.sku ?? "—",
        balance: Number(row.current_stock ?? 0),
        reorder_level: Number(row.reorder_level ?? 0),
      }));
    }

    return productInventoryRows.filter((row) => row.is_low);
  }, [lowRows, productInventoryRows]);

  function runSearch() {
    setSearchTerm(searchInput.trim());
  }

  function resetSearch() {
    setSearchInput("");
    setSearchTerm("");
  }

  function movementColor(type?: StockMovementType | null) {
    switch (type) {
      case "purchase":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "sale":
      case "damage":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "adjustment":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "transfer_in":
      case "transfer_out":
      case "transfer":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "return":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  }

  function movementIcon(type?: StockMovementType | null) {
    if (type === "purchase" || type === "transfer_in" || type === "return") {
      return <ArrowUp className="mr-1 h-3 w-3" />;
    }
    if (type === "sale" || type === "damage" || type === "transfer_out") {
      return <ArrowDown className="mr-1 h-3 w-3" />;
    }
    return <ArrowUpDown className="mr-1 h-3 w-3" />;
  }

  function openDetails(row: any) {
    setSelectedProductRow(row);
    setDetailsOpen(true);
  }

  function openAdjustment(row: any) {
    setSelectedProductRow(row);
    setForm({
      ...adjustmentInitial,
      product_id: String(row.product_id),
      warehouse_id: warehouseId !== "all" ? String(warehouseId) : "",
    });
    setAdjustOpen(true);
  }

  async function submitAdjustment() {
    const productId = Number(form.product_id);
    const selectedWarehouseId = Number(form.warehouse_id);
    const enteredQuantity = Number(form.quantity);

    if (!productId || !selectedWarehouseId) {
      toast.error("Select a warehouse before saving the stock operation.");
      return;
    }

    if (!Number.isFinite(enteredQuantity) || enteredQuantity === 0) {
      toast.error("Quantity must be greater than zero or less than zero.");
      return;
    }

    if (!form.reason.trim()) {
      toast.error("Reason is required.");
      return;
    }

    try {
      await adjustmentMutation.mutateAsync({
        product_id: productId,
        warehouse_id: selectedWarehouseId,
        movement_type: form.movement_type,
        quantity:
          form.movement_type === "damage"
            ? Math.abs(enteredQuantity)
            : enteredQuantity,
        reason: form.reason.trim(),
      });

      toast.success(
        form.movement_type === "damage"
          ? "Damaged stock recorded successfully."
          : "Stock adjustment recorded successfully.",
      );
      setAdjustOpen(false);
      setForm(adjustmentInitial);
      setSelectedProductRow(null);
    } catch (error: any) {
      const validationErrors = error?.response?.data?.errors;
      const firstValidationMessage = validationErrors
        ? Object.values(validationErrors).flat().find(Boolean)
        : null;
      toast.error(
        String(
          firstValidationMessage ??
            error?.response?.data?.message ??
            "Could not save stock operation.",
        ),
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Inventory Center</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor product movements and perform controlled stock adjustments.
          </p>
        </div>

        <Select
          value={String(warehouseId)}
          onValueChange={(value) => {
            setPage(1);
            setWarehouseId(value === "all" ? "all" : Number(value));
          }}
        >
          <SelectTrigger className="w-full md:w-[260px]">
            <Building2 className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by warehouse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All warehouses</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>All Products Inventory</CardTitle>
              <CardDescription>
                Detailed stock, supplier, category, warehouse, valuation, and
                history are available under View detail.
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <a href="/inventory/stock-movements">Movement History</a>
              </Button>
              <Button
                variant="destructive"
                onClick={() => setLowStockPopupOpen(true)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Low Stock
                <Badge variant="secondary" className="ml-2">
                  {lowStockRows.length}
                </Badge>
              </Button>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product, SKU, or category on this page..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && runSearch()}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={runSearch}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
            {searchTerm && (
              <Button variant="ghost" onClick={resetSearch}>
                <X className="mr-2 h-4 w-4" /> Clear
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Available Stock</TableHead>
                  <TableHead>Last Movement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balanceQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center">
                      <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : productInventoryRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-28 text-center text-muted-foreground"
                    >
                      {searchTerm
                        ? "No products match your search."
                        : "No products found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  productInventoryRows.map((row) => (
                    <TableRow key={row.product_id}>
                      <TableCell>
                        <div className="font-medium">{row.product_name}</div>
                        <div className="text-xs text-muted-foreground">
                          SKU: {row.sku}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-semibold">
                          {numberValue(row.balance)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.unit_of_measure}
                        </div>
                      </TableCell>
                      <TableCell>
                        {row.last_movement_type ? (
                          <div className="space-y-1">
                            <Badge
                              className={movementColor(row.last_movement_type)}
                            >
                              {movementIcon(row.last_movement_type)}
                              {titleCase(row.last_movement_type)}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(row.last_movement_at)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No movement
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={row.is_low ? "destructive" : "default"}
                          className={
                            row.is_low
                              ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
                              : ""
                          }
                        >
                          {row.is_low ? (
                            <AlertCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}
                          {row.is_low ? "Low stock" : "Available"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDetails(row)}>
                              <Eye className="mr-2 h-4 w-4" /> View detail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openAdjustment(row)}
                            >
                              <PackageCheck className="mr-2 h-4 w-4" /> Adjust /
                              Damage
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Page {meta.current_page} of {meta.last_page} · {meta.total} total
              products
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || balanceQuery.isLoading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.last_page || balanceQuery.isLoading}
                onClick={() =>
                  setPage((value) => Math.min(meta.last_page, value + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedProductRow?.product_name ?? "Inventory detail"}
            </DialogTitle>
            <DialogDescription>
              Complete product, stock, valuation, and movement information.
            </DialogDescription>
          </DialogHeader>

          {selectedProductRow && (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["SKU", selectedProductRow.sku],
                  ["Barcode", selectedProductRow.barcode ?? "—"],
                  ["Category", selectedProductRow.category_name],
                  ["Supplier", selectedProductRow.supplier_name],
                  ["Unit", selectedProductRow.unit_of_measure],
                  ["Available Stock", numberValue(selectedProductRow.balance)],
                  [
                    "Reorder Level",
                    numberValue(selectedProductRow.reorder_level),
                  ],
                  ["Stock Value", money(selectedProductRow.stock_value)],
                  [
                    "Last Unit Cost",
                    selectedProductRow.last_unit_cost == null
                      ? "—"
                      : money(selectedProductRow.last_unit_cost),
                  ],
                  ["Adjustments", selectedProductRow.adjustments_count],
                  ["Movements", selectedProductRow.movements_count],
                  [
                    "Status",
                    selectedProductRow.is_low ? "Low stock" : "Available",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {label}
                    </div>
                    <div className="mt-1 font-medium">{String(value)}</div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="mb-3 font-semibold">Recent movements</h3>
                {selectedProductRow.movements.length === 0 ? (
                  <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                    No movement history.
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedProductRow.movements
                      .slice(0, 10)
                      .map((movement: StockMovementRow) => (
                        <div
                          key={movement.id}
                          className="min-w-0 rounded-lg border bg-card p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <Badge
                              className={movementColor(movement.movement_type)}
                            >
                              {titleCase(movement.movement_type)}
                            </Badge>
                            <span className="text-sm font-semibold">
                              {numberValue(movement.quantity)}
                            </span>
                          </div>
                          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                            <div className="min-w-0">
                              <div className="text-xs text-muted-foreground">
                                Warehouse
                              </div>
                              <div className="break-words font-medium">
                                {getWarehouseName(movement)}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-muted-foreground">
                                Performed by
                              </div>
                              <div className="break-words font-medium">
                                {movement.performedBy?.name ?? "—"}
                              </div>
                            </div>
                            <div className="min-w-0 sm:col-span-2">
                              <div className="text-xs text-muted-foreground">
                                Date
                              </div>
                              <div className="break-words font-medium">
                                {formatDate(movement.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adjust inventory</DialogTitle>
            <DialogDescription>
              {selectedProductRow?.product_name}. Use a positive quantity to add
              stock and a negative quantity to reduce stock. Damage always
              reduces stock.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Warehouse *</Label>
              <Select
                value={form.warehouse_id}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, warehouse_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Operation *</Label>
              <Select
                value={form.movement_type}
                onValueChange={(value: "adjustment" | "damage") =>
                  setForm((current) => ({
                    ...current,
                    movement_type: value,
                    quantity: "",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                  <SelectItem value="damage">Damaged Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input
                type="number"
                step="0.001"
                min={form.movement_type === "damage" ? "0.001" : undefined}
                value={form.quantity}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    quantity: event.target.value,
                  }))
                }
                placeholder={
                  form.movement_type === "damage"
                    ? "Quantity damaged"
                    : "Example: 10 or -5"
                }
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Reason *</Label>
              <Input
                value={form.reason}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
                placeholder="Reason for this operation"
                maxLength={255}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjustOpen(false)}
              disabled={adjustmentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={submitAdjustment}
              disabled={adjustmentMutation.isPending}
            >
              {adjustmentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save operation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={lowStockPopupOpen} onOpenChange={setLowStockPopupOpen}>
        <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Low-stock products</DialogTitle>
            <DialogDescription>
              Products whose current stock is at or below the configured reorder
              level.
            </DialogDescription>
          </DialogHeader>
          {lowStockQuery.isLoading ? (
            <div className="rounded-lg border p-8 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin" />
            </div>
          ) : lowStockRows.length === 0 ? (
            <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
              No low-stock products.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {lowStockRows.map((row: any) => (
                <div
                  key={row.product_id}
                  className="min-w-0 rounded-lg border bg-card p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="break-words font-semibold">
                        {row.product_name}
                      </div>
                      <div className="break-all text-xs text-muted-foreground">
                        SKU: {row.sku}
                      </div>
                    </div>
                    <Badge variant="destructive">Low stock</Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Category
                      </div>
                      <div className="break-words font-medium">
                        {row.category_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Current stock
                      </div>
                      <div className="font-semibold">
                        {numberValue(row.balance)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-muted-foreground">
                        Reorder level
                      </div>
                      <div className="font-semibold">
                        {numberValue(row.reorder_level)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
