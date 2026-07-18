'use client';

import { useMemo, useState } from 'react';
import { Calculator, Search, Tags } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import { useProductsQuery } from '@/queries/product.queries';

function money(value: unknown) {
  return `${Number(value ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} ETB`;
}

function calc(price: unknown, percent: number) {
  return Number(price ?? 0) * percent;
}

export default function ProductPriceTiersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const productsQuery = useProductsQuery({
    page,
    per_page: 10,
    search,
    active: '1',
  });

  const rows = productsQuery.data?.data ?? [];

  const meta = productsQuery.data?.meta ?? {
    current_page: page,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

  const totals = useMemo(() => {
    return {
      products: meta.total,
      loaded: rows.length,
    };
  }, [meta.total, rows.length]);

  function runSearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Tags className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold">Product Price Tiers</h1>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          View suggested distributor, wholesale, and bulk prices based on product
          unit price.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.products}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Loaded This Page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.loaded}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Price Tier List
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Current backend stores one unit price. These tiers are calculated
              in frontend.
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && runSearch()}
                placeholder="Search product or SKU..."
                className="pl-9"
              />
            </div>

            <Button variant="outline" onClick={runSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Base Price</TableHead>
                  <TableHead className="text-right">Distributor</TableHead>
                  <TableHead className="text-right">Wholesale</TableHead>
                  <TableHead className="text-right">Bulk</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {productsQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>Loading price tiers...</TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>No products found.</TableCell>
                  </TableRow>
                ) : (
                  rows.map((product) => {
                    const base = Number(product.unit_price ?? 0);

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            SKU: {product.sku}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Unit: {product.unit_of_measure ?? 'unit'}
                          </div>
                        </TableCell>

                        <TableCell>
                          {product.category?.name ??
                            product.product_category_id ??
                            '—'}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          {money(base)}
                        </TableCell>

                        <TableCell className="text-right">
                          {money(calc(base, 0.98))}
                          <div className="text-xs text-muted-foreground">
                            2% discount
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          {money(calc(base, 0.95))}
                          <div className="text-xs text-muted-foreground">
                            5% discount
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          {money(calc(base, 0.9))}
                          <div className="text-xs text-muted-foreground">
                            10% discount
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={product.is_active ? 'default' : 'secondary'}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {meta.current_page} of {meta.last_page} • Total {meta.total}
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || productsQuery.isLoading}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.last_page || productsQuery.isLoading}
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