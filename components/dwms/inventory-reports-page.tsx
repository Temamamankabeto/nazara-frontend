'use client';

import { useState } from 'react';
import { AlertTriangle, ClipboardList, DollarSign, Warehouse } from 'lucide-react';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  useAdjustmentReportQuery,
  useLowStockAlertsQuery,
  useStockValuationQuery,
  useStockValuationSummaryQuery,
  useWarehouseSummaryQuery,
} from '@/queries/inventory.queries';
import { useWarehousesQuery } from '@/queries/warehouse.queries';
import type { StockMovementRow } from '@/types/inventory.types';

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

function getMovementTypeColor(type: string) {
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

function PaginationFooter({
  page,
  lastPage,
  total,
  isLoading,
  onPageChange,
}: {
  page: number;
  lastPage: number;
  total: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <span>
        Page {page} of {lastPage} • Total {total}
      </span>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= lastPage || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default function InventoryReportsPage() {
  const [warehouseId, setWarehouseId] = useState<number | 'all'>('all');

  const [valuationPage, setValuationPage] = useState(1);
  const [warehousePage, setWarehousePage] = useState(1);
  const [adjustmentPage, setAdjustmentPage] = useState(1);
  const [lowStockPage, setLowStockPage] = useState(1);

  const warehousesQuery = useWarehousesQuery({ per_page: 100 });
  const valuationSummaryQuery = useStockValuationSummaryQuery();

  const valuationQuery = useStockValuationQuery({
    warehouse_id: warehouseId,
    page: valuationPage,
    per_page: 10,
  });

  const warehouseSummaryQuery = useWarehouseSummaryQuery({
    page: warehousePage,
    per_page: 10,
  });

  const adjustmentQuery = useAdjustmentReportQuery({
    warehouse_id: warehouseId === 'all' ? undefined : warehouseId,
    page: adjustmentPage,
    per_page: 10,
  });

  const lowStockQuery = useLowStockAlertsQuery({
    warehouse_id: warehouseId === 'all' ? undefined : warehouseId,
    page: lowStockPage,
    per_page: 10,
  });

  const summary = valuationSummaryQuery.data?.data;

  const valuationRows = valuationQuery.data?.data ?? [];
  const warehouseRows = warehouseSummaryQuery.data?.data ?? [];
  const adjustmentRows = adjustmentQuery.data?.data ?? [];
  const lowRows = lowStockQuery.data?.data ?? [];

  const valuationMeta = valuationQuery.data?.meta ?? {
    current_page: valuationPage,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

  const warehouseMeta = warehouseSummaryQuery.data?.meta ?? {
    current_page: warehousePage,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

  const adjustmentMeta = adjustmentQuery.data?.meta ?? {
    current_page: adjustmentPage,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

  const lowStockMeta = lowStockQuery.data?.meta ?? {
    current_page: lowStockPage,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

  function changeWarehouse(value: string) {
    setWarehouseId(value === 'all' ? 'all' : Number(value));
    setValuationPage(1);
    setAdjustmentPage(1);
    setLowStockPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventory Reports</h1>
          <p className="text-sm text-muted-foreground">
            Valuation, warehouse summary, adjustments, damages, and low-stock
            reports.
          </p>
        </div>

        <Select value={String(warehouseId)} onValueChange={changeWarehouse}>
          <SelectTrigger className="w-full md:w-[260px]">
            <SelectValue placeholder="Warehouse" />
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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4" />
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {money(summary?.total_value)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Warehouse className="h-4 w-4" />
              Warehouses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.warehouse_count ?? warehouseMeta.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.product_count ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lowStockMeta.total}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="valuation" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouse Summary</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustment/Damage Report</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="valuation">
          <Card>
            <CardHeader>
              <CardTitle>Stock Valuation</CardTitle>
              <CardDescription>
                Backend valuation uses stock balance × last unit cost.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Last Cost</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {valuationQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : valuationRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No valuation data.
                        </TableCell>
                      </TableRow>
                    ) : (
                      valuationRows.map((row, index) => (
                        <TableRow
                          key={`${row.product_id}-${row.warehouse_id}-${index}`}
                        >
                          <TableCell className="font-medium">
                            {row.product?.name ?? `Product #${row.product_id}`}
                            {row.product?.sku && (
                              <div className="text-xs text-muted-foreground">
                                SKU: {row.product.sku}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {row.warehouse?.name ?? `Warehouse #${row.warehouse_id}`}
                          </TableCell>
                          <TableCell className="text-right">
                            {n(row.stock_balance)}
                          </TableCell>
                          <TableCell className="text-right">
                            {money(row.last_unit_cost)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                            {money(row.stock_value)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <PaginationFooter
                page={valuationMeta.current_page}
                lastPage={valuationMeta.last_page}
                total={valuationMeta.total}
                isLoading={valuationQuery.isLoading}
                onPageChange={setValuationPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Summary</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead className="text-right">Movements</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {warehouseSummaryQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : warehouseRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No warehouses found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      warehouseRows.map((warehouse) => (
                        <TableRow key={warehouse.id}>
                          <TableCell className="font-medium">{warehouse.name}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {warehouse.code}
                            </code>
                          </TableCell>
                          <TableCell>{warehouse.branch?.name ?? '—'}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">
                              {warehouse.stock_movements_count ?? 0} movements
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <PaginationFooter
                page={warehouseMeta.current_page}
                lastPage={warehouseMeta.last_page}
                total={warehouseMeta.total}
                isLoading={warehouseSummaryQuery.isLoading}
                onPageChange={setWarehousePage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Adjustment & Damaged Stock
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {adjustmentQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : adjustmentRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No adjustment report data.
                        </TableCell>
                      </TableRow>
                    ) : (
                      adjustmentRows.map((row: StockMovementRow) => (
                        <TableRow key={row.id}>
                          <TableCell className="whitespace-nowrap">{date(row.created_at)}</TableCell>
                          <TableCell>
                            <div className="font-medium">{row.product?.name ?? `Product #${row.product_id}`}</div>
                            {row.product?.sku && (
                              <div className="text-xs text-muted-foreground">
                                SKU: {row.product.sku}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{row.warehouse?.name ?? `Warehouse #${row.warehouse_id}`}</TableCell>
                          <TableCell>
                            <Badge className={getMovementTypeColor(row.movement_type)}>
                              {row.movement_type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {Number(row.quantity) > 0 ? '+' : ''}{n(row.quantity)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {row.notes ?? '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <PaginationFooter
                page={adjustmentMeta.current_page}
                lastPage={adjustmentMeta.last_page}
                total={adjustmentMeta.total}
                isLoading={adjustmentQuery.isLoading}
                onPageChange={setAdjustmentPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Reorder Level</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {lowStockQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : lowRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No low stock items.
                        </TableCell>
                      </TableRow>
                    ) : (
                      lowRows.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            {product.category?.name ??
                              product.product_category_id ?? '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="destructive" className="font-semibold">
                              {n(product.current_stock)} units
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">
                              {n(product.reorder_level)} units
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">Low Stock</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <PaginationFooter
                page={lowStockMeta.current_page}
                lastPage={lowStockMeta.last_page}
                total={lowStockMeta.total}
                isLoading={lowStockQuery.isLoading}
                onPageChange={setLowStockPage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}