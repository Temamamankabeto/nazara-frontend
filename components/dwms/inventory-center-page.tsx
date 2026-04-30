'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Building2,
  Calendar,
  CheckCircle,
  Eye,
  MoreVertical,
  Package,
  PackageCheck,
  Plus,
  Minus,
  RefreshCcw,
  Search,
  Trash2,
  Warehouse,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

import { useCreateStockAdjustmentMutation } from '@/hooks/use-inventory';
import {
  useLowStockAlertsQuery,
  useStockBalanceQuery,
  useStockMovementsQuery,
} from '@/queries/inventory.queries';
import { useWarehousesQuery } from '@/queries/warehouse.queries';
import type { StockBalanceRow, LowStockRow, StockMovementRow, StockMovementType } from '@/types/inventory.types';

const adjustmentInitial = {
  product_id: '',
  warehouse_id: '',
  movement_type: 'adjustment' as 'adjustment' | 'damage',
  quantity: '',
  unit_cost: '',
  reason: '',
  notes: '',
};

function n(value: unknown) {
  return Number(value ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 3,
  });
}

function money(value: unknown) {
  return `${Number(value ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} ETB`;
}

function date(value?: string) {
  return value ? new Date(value).toLocaleString() : '—';
}

function getCategoryName(row: any) {
  return row.category?.name ?? row.product?.category?.name ?? row.product_category_id ?? '—';
}

function getProductName(row: any) {
  return row.name ?? row.product?.name ?? `Product #${row.product_id ?? row.id}`;
}

function getProductId(row: any) {
  return Number(row.product_id ?? row.id ?? row.product?.id);
}

export default function InventoryCenterPage() {
  const [page, setPage] = useState(1);
  const [warehouseId, setWarehouseId] = useState<number | 'all'>('all');
  const [searchInput, setSearchInput] = useState('');
  // Search is handled client-side since API doesn't support it
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState(adjustmentInitial);
  const [selectedProductRow, setSelectedProductRow] = useState<any>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [lowStockPopupOpen, setLowStockPopupOpen] = useState(false);

  const warehousesQuery = useWarehousesQuery({ per_page: 100 });

  const balanceQuery = useStockBalanceQuery({
    warehouse_id: warehouseId,
    page,
    per_page: 10,
  });

  const lowStockQuery = useLowStockAlertsQuery({
    warehouse_id: warehouseId === 'all' ? undefined : warehouseId,
    per_page: 100,
  });

  const movementsQuery = useStockMovementsQuery({
    warehouse_id: warehouseId === 'all' ? undefined : warehouseId,
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

  // Process inventory rows with full product info and client-side search
  const productInventoryRows = useMemo(() => {
    const processed = inventoryRows.map((row: StockBalanceRow) => {
      const productId = getProductId(row);

      const productMovements = movementRows.filter(
        (movement: StockMovementRow) => Number(movement.product_id) === productId
      );

      const adjustments = productMovements.filter((movement: StockMovementRow) =>
        ['adjustment', 'damage', 'return'].includes(movement.movement_type)
      );

      const balance = Number(row.stock_balance ?? 0);
      const reorderLevel = Number(row.reorder_level ?? row.product?.reorder_level ?? 0);

      return {
        ...row,
        product_id: productId,
        product_name: getProductName(row),
        category_name: getCategoryName(row),
        sku: row.sku ?? row.product?.sku ?? '—',
        barcode: row.barcode ?? row.product?.barcode ?? null,
        package_size: row.package_size ?? row.product?.package_size ?? '—',
        unit_of_measure: row.unit_of_measure ?? row.product?.unit_of_measure ?? 'unit',
        supplier_name: row.supplier?.name ?? row.product?.supplier?.name ?? '—',
        balance,
        reorder_level: reorderLevel,
        stock_value: Number(row.stock_value ?? 0),
        last_unit_cost: row.last_unit_cost ?? null,
        movements_count: Number(row.movements_count ?? productMovements.length),
        adjustments_count: Number(row.adjustments_count ?? adjustments.length),
        last_movement_type: row.last_movement_type ?? productMovements[0]?.movement_type ?? null,
        movements: productMovements,
        adjustments,
        is_low: reorderLevel > 0 && balance <= reorderLevel,
      };
    });

    // Client-side search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return processed.filter(row => 
        row.product_name.toLowerCase().includes(term) ||
        row.sku.toLowerCase().includes(term) ||
        row.category_name.toLowerCase().includes(term)
      );
    }

    return processed;
  }, [inventoryRows, movementRows, searchTerm]);

  const lowStockRows = useMemo(() => {
    const fromCurrentPage = productInventoryRows.filter((row) => row.is_low);

    if (lowRows.length > 0) {
      return lowRows.map((row: LowStockRow) => {
        const productId = getProductId(row);
        const balance = Number(row.current_stock ?? 0);
        const reorderLevel = Number(row.reorder_level ?? 0);

        return {
          ...row,
          product_id: productId,
          product_name: getProductName(row),
          category_name: getCategoryName(row),
          sku: row.sku ?? '—',
          supplier_name: row.supplier?.name ?? '—',
          balance,
          reorder_level: reorderLevel,
          is_low: reorderLevel > 0 && balance <= reorderLevel,
        };
      });
    }

    return fromCurrentPage;
  }, [lowRows, productInventoryRows]);

  function runSearch() {
    setPage(1);
    setSearchTerm(searchInput.trim());
  }

  function resetSearch() {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
  }

  function getMovementTypeIcon(type: StockMovementType) {
    switch (type) {
      case 'purchase':
        return <Plus className="h-3 w-3 text-green-600" />;
      case 'sale':
        return <Minus className="h-3 w-3 text-red-600" />;
      case 'adjustment':
        return <ArrowUpDown className="h-3 w-3 text-blue-600" />;
      case 'damage':
        return <Trash2 className="h-3 w-3 text-red-600" />;
      case 'return':
        return <RefreshCcw className="h-3 w-3 text-orange-600" />;
      default:
        return <Package className="h-3 w-3" />;
    }
  }

  function getMovementTypeColor(type: StockMovementType) {
    switch (type) {
      case 'purchase':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'sale':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'adjustment':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'damage':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'transfer_in':
      case 'transfer_out':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'return':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'initial_stock':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
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
      warehouse_id: warehouseId !== 'all' ? String(warehouseId) : '',
    });
    setAdjustOpen(true);
  }

  async function submitAdjustment() {
    try {
      await adjustmentMutation.mutateAsync({
        product_id: Number(form.product_id),
        warehouse_id: Number(form.warehouse_id),
        movement_type: form.movement_type,
        quantity: Number(form.quantity),
        unit_cost: form.unit_cost ? Number(form.unit_cost) : null,
        reason:
          form.reason ||
          (form.movement_type === 'damage'
            ? 'Damaged stock'
            : 'Manual stock adjustment'),
        notes: form.notes || null,
      });

      toast.success(
        form.movement_type === 'damage'
          ? 'Damaged stock recorded'
          : 'Stock adjustment recorded'
      );

      setAdjustOpen(false);
      setForm(adjustmentInitial);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Could not save stock operation.');
    }
  }

  const paginatedRows = productInventoryRows.slice(
    (page - 1) * 10,
    page * 10
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Inventory Center</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Product-first inventory list with stock, reorder level, movement,
            valuation, and adjustment actions.
          </p>
        </div>

        <Select
          value={String(warehouseId)}
          onValueChange={(value) => {
            setPage(1);
            setWarehouseId(value === 'all' ? 'all' : Number(value));
          }}
        >
          <SelectTrigger className="w-full md:w-[260px]">
            <Building2 className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by warehouse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All warehouses</SelectItem>
            {(warehousesQuery.data?.data ?? []).map((warehouse) => (
              <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-lg font-semibold">All Products Inventory</CardTitle>
              <CardDescription className="mt-1">
                Backend inventory index lists all products first, then attaches
                stock/reorder/movement information.
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <Button variant="link" asChild>
                <a href="/inventory/stock-movements">See all Movement History</a>
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={() => setLowStockPopupOpen(true)}
                className="flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Low Stock Items
                <Badge variant="secondary">{lowStockRows.length}</Badge>
              </Button>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product, SKU, or category..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && runSearch()}
                className="pl-9"
              />
            </div>

            <Button variant="outline" onClick={runSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>

            {searchTerm && (
              <Button variant="ghost" onClick={resetSearch}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Stock / Reorder</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Adjustments</TableHead>
                  <TableHead className="text-right">Movements</TableHead>
                  <TableHead>Last Movement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {balanceQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No products match your search.' : 'No products found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row) => (
                    <TableRow key={row.product_id}>
                      <TableCell>
                        <div className="font-medium">{row.product_name}</div>
                        <div className="text-xs text-muted-foreground">
                          SKU: {row.sku}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.barcode ? `Barcode: ${row.barcode}` : 'No barcode'} •{' '}
                          {row.package_size ?? 'No package'} /{' '}
                          {row.unit_of_measure ?? 'unit'}
                        </div>
                      </TableCell>

                      <TableCell>{row.category_name}</TableCell>
                      <TableCell>{row.supplier_name}</TableCell>

                      <TableCell>
                        <div>{n(row.balance)} available</div>
                        <div className="text-xs text-muted-foreground">
                          Reorder: {n(row.reorder_level)}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        {money(row.stock_value)}
                      </TableCell>

                      <TableCell className="text-right">
                        {row.adjustments_count}
                      </TableCell>

                      <TableCell className="text-right">
                        {row.movements_count}
                      </TableCell>

                      <TableCell>
                        {row.last_movement_type ? (
                          <Badge className={getMovementTypeColor(row.last_movement_type)}>
                            {row.last_movement_type}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">No movement</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={row.is_low ? 'destructive' : 'default'}
                          className={
                            row.is_low
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              : ''
                          }
                        >
                          {row.is_low ? (
                            <AlertCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}
                          {row.is_low ? 'Low stock' : 'Available'}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open actions</span>
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => openDetails(row)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View detail
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => openAdjustment(row)}>
                              <PackageCheck className="mr-2 h-4 w-4" />
                              Adjust / Damage
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

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page} of {Math.ceil(productInventoryRows.length / 10) || 1} · {productInventoryRows.length} total products
              {searchTerm && ` (filtered from ${meta.total})`}
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || balanceQuery.isLoading}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(productInventoryRows.length / 10) || balanceQuery.isLoading}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Dialog, Details Dialog, and Adjustment Dialog remain the same */}
      {/* ... (keep the existing dialog components) ... */}
    </div>
  );
}