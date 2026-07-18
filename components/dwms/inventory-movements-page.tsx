'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useStockMovementsQuery } from '@/queries/inventory.queries';
import { useWarehousesQuery } from '@/queries/warehouse.queries';
import type { StockMovementType } from '@/types/inventory.types';

function n(value: unknown) {
  return Number(value ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 3,
  });
}

function money(value: unknown) {
  return `${Number(value ?? 0).toLocaleString()} ETB`;
}

function date(value?: string) {
  return value ? new Date(value).toLocaleString() : '—';
}

const movementTypes: Array<StockMovementType | 'all'> = [
  'all',
  'purchase',
  'sale',
  'return',
  'adjustment',
  'damage',
  'transfer_in',
  'transfer_out',
  'initial_stock',
];

function movementQuantity(
  type: StockMovementType,
  quantity: number | string,
  target: 'adjustment' | 'purchase' | 'sale'
) {
  const value = Number(quantity ?? 0);

  if (target === 'adjustment' && ['adjustment', 'damage'].includes(type)) {
    return value;
  }

  if (target === 'purchase' && type === 'purchase') {
    return value;
  }

  if (target === 'sale' && type === 'sale') {
    return Math.abs(value);
  }

  return null;
}

export default function InventoryMovementsPage() {
  const [page, setPage] = useState(1);
  const [warehouseId, setWarehouseId] = useState<number | 'all'>('all');
  const [movementType, setMovementType] = useState<StockMovementType | 'all'>(
    'all'
  );

  const warehousesQuery = useWarehousesQuery({ per_page: 100 });

  const query = useStockMovementsQuery({
    warehouse_id: warehouseId,
    movement_type: movementType === 'all' ? undefined : movementType,
    page,
    per_page: 10,
  });

  const rows = query.data?.data ?? [];
  const meta = query.data?.meta ?? {
    current_page: page,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

  const missingEndpoint = query.isError;

  function changeWarehouse(value: string) {
    setPage(1);
    setWarehouseId(value === 'all' ? 'all' : Number(value));
  }

  function changeMovementType(value: StockMovementType | 'all') {
    setPage(1);
    setMovementType(value);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Stock Movements</h1>
        <p className="text-sm text-muted-foreground">
          Movement history for purchase, sale, transfer, return, adjustment, and
          damage stock operations.
        </p>
      </div>

      {missingEndpoint && (
        <Card className="border-amber-200">
          <CardContent className="pt-6 text-sm text-amber-700">
            Your current backend does not expose <strong>/stock-movements</strong>{' '}
            yet. The stock_movements table exists, but a controller route is
            needed to list movement history.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Movement history</CardTitle>

          <div className="grid gap-2 md:grid-cols-2">
            <Select 
              value={String(warehouseId)} 
              onValueChange={changeWarehouse}
            >
              <SelectTrigger>
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

            <Select
              value={movementType}
              onValueChange={(value) =>
                changeMovementType(value as StockMovementType | 'all')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Movement type" />
              </SelectTrigger>

              <SelectContent>
                {movementTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All movement types' : type.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Adjustment Quantity</TableHead>
                  <TableHead className="text-right">Purchase Quantity</TableHead>
                  <TableHead className="text-right">Sale Quantity</TableHead>
                  <TableHead className="text-right">Total Available</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {query.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {missingEndpoint
                        ? 'Backend route missing. Add GET /stock-movements to enable this page.'
                        : 'No stock movements found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap">{date(row.created_at)}</TableCell>

                      <TableCell>
                        <div className="font-medium">{row.product?.name ?? `Product #${row.product_id}`}</div>
                        {row.product?.sku && (
                          <div className="text-xs text-muted-foreground">SKU: {row.product.sku}</div>
                        )}
                      </TableCell>

                      <TableCell className="text-right font-medium">
                        {movementQuantity(row.movement_type, row.quantity, 'adjustment') === null
                          ? '—'
                          : n(movementQuantity(row.movement_type, row.quantity, 'adjustment'))}
                      </TableCell>

                      <TableCell className="text-right font-medium text-emerald-700 dark:text-emerald-400">
                        {movementQuantity(row.movement_type, row.quantity, 'purchase') === null
                          ? '—'
                          : n(movementQuantity(row.movement_type, row.quantity, 'purchase'))}
                      </TableCell>

                      <TableCell className="text-right font-medium text-rose-700 dark:text-rose-400">
                        {movementQuantity(row.movement_type, row.quantity, 'sale') === null
                          ? '—'
                          : n(movementQuantity(row.movement_type, row.quantity, 'sale'))}
                      </TableCell>

                      <TableCell className="text-right font-semibold">
                        {n(row.total_available)}
                      </TableCell>

                      <TableCell className="text-right">
                        {row.unit_cost !== null && row.unit_cost !== undefined
                          ? money(row.unit_cost)
                          : '—'}
                      </TableCell>

                      <TableCell className="max-w-sm whitespace-normal break-words">
                        {row.notes ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {meta.current_page} of {meta.last_page} • Total {meta.total} movements
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || query.isLoading}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.last_page || query.isLoading}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}