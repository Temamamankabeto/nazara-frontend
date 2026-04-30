'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit cost</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {query.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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

                      <TableCell>{row.warehouse?.name ?? `Warehouse #${row.warehouse_id}`}</TableCell>

                      <TableCell>
                        <Badge className={getMovementTypeColor(row.movement_type)}>
                          {row.movement_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right font-semibold">
                        {Number(row.quantity) > 0
                          ? `+${n(row.quantity)}`
                          : n(row.quantity)}
                      </TableCell>

                      <TableCell className="text-right">
                        {row.unit_cost ? money(row.unit_cost) : '—'}
                      </TableCell>

                      <TableCell className="max-w-md truncate">
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