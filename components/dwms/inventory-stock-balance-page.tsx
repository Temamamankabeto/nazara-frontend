'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, PackageCheck, Search, Warehouse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStockBalanceQuery } from '@/queries/inventory.queries';
import { useWarehousesQuery } from '@/queries/warehouse.queries';
import type { StockBalanceRow } from '@/types/inventory.types';

function n(value: unknown) { 
  return Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 }); 
}

function money(value: unknown) { 
  return `${Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB`; 
}

export default function InventoryStockBalancePage() {
  const [warehouseId, setWarehouseId] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const warehousesQuery = useWarehousesQuery({ per_page: 100 });
  const balanceQuery = useStockBalanceQuery({ 
    warehouse_id: warehouseId,
    per_page: 1000 // Fetch more records for client-side filtering
  });
  
  const rows = useMemo(() => {
    const term = search.toLowerCase();
    const data = balanceQuery.data?.data ?? [];
    
    if (!term) return data;
    
    return data.filter((row: StockBalanceRow) => 
      row.product?.name?.toLowerCase().includes(term) ||
      row.product?.sku?.toLowerCase().includes(term) ||
      row.warehouse?.name?.toLowerCase().includes(term)
    );
  }, [balanceQuery.data?.data, search]);
  
  const totalQty = rows.reduce((sum, row) => sum + Number(row.stock_balance ?? 0), 0);
  const totalValue = rows.reduce((sum, row) => sum + Number(row.stock_balance ?? 0) * Number(row.product?.unit_price ?? 0), 0);
  const lowRows = rows.filter((row) => Number(row.stock_balance ?? 0) <= Number(row.product?.reorder_level ?? 0));

  function changeWarehouse(value: string) {
    setWarehouseId(value === 'all' ? 'all' : Number(value));
    setSearch(''); // Reset search when changing warehouse
    setSearchInput('');
  }

  function handleSearch() {
    setSearch(searchInput.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  function resetSearch() {
    setSearch('');
    setSearchInput('');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Stock Balance</h1>
        <p className="text-sm text-muted-foreground">
          Track product stock per warehouse using backend /reports/stock-balance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <PackageCheck className="h-4 w-4" />
              Total quantity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{n(totalQty)}</div>
            <p className="text-xs text-muted-foreground">units across all products</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Warehouse className="h-4 w-4" />
              Stock value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{money(totalValue)}</div>
            <p className="text-xs text-muted-foreground">total inventory value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Below reorder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowRows.length}</div>
            <p className="text-xs text-muted-foreground">products need attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Warehouse stock</CardTitle>
          
          <div className="grid gap-2 md:grid-cols-[1fr_220px_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search product, SKU, warehouse..." 
                value={searchInput} 
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            
            <Select value={String(warehouseId)} onValueChange={changeWarehouse}>
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
            
            <Button variant="outline" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            
            {search && (
              <Button variant="ghost" onClick={resetSearch}>
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
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Reorder</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {balanceQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {search ? 'No stock balance matches your search.' : 'No stock balance found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row: StockBalanceRow, index) => {
                    const isLow = Number(row.stock_balance ?? 0) <= Number(row.product?.reorder_level ?? 0);
                    const stockBalance = Number(row.stock_balance ?? 0);
                    const unitPrice = Number(row.product?.unit_price ?? 0);
                    const reorderLevel = Number(row.product?.reorder_level ?? 0);
                    
                    return (
                      <TableRow key={`${row.product_id}-${row.warehouse_id}-${index}`}>
                        <TableCell>
                          <div className="font-medium">{row.product?.name ?? `Product #${row.product_id}`}</div>
                          <div className="text-xs text-muted-foreground">
                            SKU: {row.product?.sku ?? '—'} • {row.product?.package_size ?? '—'}
                          </div>
                          {row.product?.barcode && (
                            <div className="text-xs text-muted-foreground">
                              Barcode: {row.product.barcode}
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div>{row.warehouse?.name ?? `Warehouse #${row.warehouse_id}`}</div>
                          {row.warehouse?.code && (
                            <div className="text-xs text-muted-foreground">
                              Code: {row.warehouse.code}
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell className="text-right font-semibold">
                          {n(stockBalance)}
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <Badge variant="outline">
                            {n(reorderLevel)}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="text-right text-green-600 dark:text-green-400">
                          {money(stockBalance * unitPrice)}
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={isLow ? 'destructive' : 'default'}>
                            {isLow ? (
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Low stock
                              </div>
                            ) : (
                              'Available'
                            )}
                          </Badge>
                          {isLow && reorderLevel > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {Math.round((stockBalance / reorderLevel) * 100)}% of reorder level
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {rows.length} of {balanceQuery.data?.data?.length ?? 0} records
            {search && ` (filtered from ${balanceQuery.data?.data?.length ?? 0})`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}