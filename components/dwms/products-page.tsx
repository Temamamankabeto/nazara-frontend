'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Barcode,
  Boxes,
  Edit,
  Eye,
  MoreHorizontal,
  PackageSearch,
  Power,
  Search,
  Tags,
  Trash2,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Switch } from '@/components/ui/switch';
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
  useCreateProductMutation,
  useDeleteProductMutation,
  useToggleProductStatusMutation,
  useUpdateProductMutation,
} from '@/hooks/use-products';

import { useProductsQuery, useSuppliersLiteQuery } from '@/queries/product.queries';

import {
  DEFAULT_PACKAGE_UNITS,
  DEFAULT_PRODUCT_CATEGORIES,
  type ProductFormPayload,
  type ProductFormState,
  type ProductRow,
} from '@/types/product.types';

const initialForm: ProductFormState = {
  product_category_id: '1',
  supplier_id: 'none',
  name: '',
  sku: '',
  barcode: '',
  package_size: '',
  unit_of_measure: 'carton',
  unit_price: '',
  reorder_level: '0',
  tier_distributor: '',
  tier_wholesale: '',
  tier_bulk: '',
  is_active: true,
};

function money(value: number | string | null | undefined) {
  return `${Number(value ?? 0).toLocaleString()} ETB`;
}

function stockOf(product: ProductRow) {
  return Number(product.current_stock ?? product.stock_quantity ?? 0);
}

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<'all' | '1' | '0'>('all');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [supplierId, setSupplierId] = useState<string>('all');

  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [lowStockPopupOpen, setLowStockPopupOpen] = useState(false);

  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [selected, setSelected] = useState<ProductRow | null>(null);

  const [form, setForm] = useState<ProductFormState>(initialForm);

  const filters = {
    page,
    per_page: 10,
    search,
    active,
    product_category_id: categoryId,
    supplier_id: supplierId,
  };

  const productsQuery = useProductsQuery(filters);
  const suppliersQuery = useSuppliersLiteQuery();

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const toggleMutation = useToggleProductStatusMutation();
  const deleteMutation = useDeleteProductMutation();

  const rows = productsQuery.data?.data ?? [];
  const suppliers = suppliersQuery.data?.data ?? [];
  const meta = productsQuery.data?.meta ?? {
    current_page: page,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

  const lowStockProducts = useMemo(
    () =>
      rows.filter(
        (row) =>
          Number(row.reorder_level ?? 0) > 0 &&
          stockOf(row) <= Number(row.reorder_level ?? 0)
      ),
    [rows]
  );

  const stats = useMemo(
    () => ({
      total: meta.total,
      lowStock: lowStockProducts.length,
    }),
    [meta.total, lowStockProducts.length]
  );

  function categoryName(product: ProductRow) {
    return (
      product.category?.name ??
      DEFAULT_PRODUCT_CATEGORIES.find(
        (category) =>
          String(category.id) === String(product.product_category_id)
      )?.name ??
      product.product_category_id
    );
  }

  function runSearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  function openCreateDialog() {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  }

  function openEditDialog(product: ProductRow) {
    setEditing(product);

    const base = Number(product.unit_price ?? 0);

    setForm({
      product_category_id: String(
        product.product_category_id ?? product.category?.id ?? '1'
      ),
      supplier_id: product.supplier_id ? String(product.supplier_id) : 'none',
      name: product.name ?? '',
      sku: product.sku ?? '',
      barcode: product.barcode ?? '',
      package_size: product.package_size ?? '',
      unit_of_measure: product.unit_of_measure ?? 'carton',
      unit_price: String(product.unit_price ?? ''),
      reorder_level: String(product.reorder_level ?? '0'),
      tier_distributor: String(Math.max(base * 0.98, 0).toFixed(2)),
      tier_wholesale: String(Math.max(base * 0.95, 0).toFixed(2)),
      tier_bulk: String(Math.max(base * 0.9, 0).toFixed(2)),
      is_active: product.is_active ?? true,
    });

    setOpen(true);
  }

  function openDetails(product: ProductRow) {
    setSelected(product);
    setDetailsOpen(true);
  }

  function openLowStockPopup() {
    setLowStockPopupOpen(true);
  }

  async function submitProduct() {
    const payload: ProductFormPayload = {
      product_category_id: Number(form.product_category_id),
      supplier_id: form.supplier_id === 'none' ? null : Number(form.supplier_id),
      name: form.name,
      sku: form.sku,
      barcode: form.barcode || null,
      package_size: form.package_size || null,
      unit_of_measure: form.unit_of_measure || null,
      unit_price: Number(form.unit_price || 0),
      reorder_level: Number(form.reorder_level || 0),
      is_active: form.is_active,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          payload,
        });

        toast.success('Product updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Product created successfully');
      }

      setOpen(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Could not save product'
      );
    }
  }

  async function toggleProduct(product: ProductRow) {
    try {
      await toggleMutation.mutateAsync(product.id);
      toast.success('Product status updated');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Could not update product status'
      );
    }
  }

  async function removeProduct(product: ProductRow) {
    if (!confirm(`Delete ${product.name}?`)) return;

    try {
      await deleteMutation.mutateAsync(product.id);
      toast.success('Product deleted');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Could not delete product'
      );
    }
  }

  function generateSku() {
    const category = DEFAULT_PRODUCT_CATEGORIES.find(
      (item) => String(item.id) === String(form.product_category_id)
    );

    const namePart =
      form.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'PD';

    const sizePart = form.package_size.replace(/\s+/g, '').toUpperCase() || 'UNIT';

    setForm((current) => ({
      ...current,
      sku: `${category?.code ?? 'PRD'}-${namePart}-${sizePart}`,
    }));
  }

  function calculateTiers() {
    const base = Number(form.unit_price || 0);

    setForm((current) => ({
      ...current,
      tier_distributor: String((base * 0.98).toFixed(2)),
      tier_wholesale: String((base * 0.95).toFixed(2)),
      tier_bulk: String((base * 0.9).toFixed(2)),
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Product Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage detergent SKUs, categories, package sizes, barcode, supplier
            references, prices, stock visibility, and reorder levels.
          </p>
        </div>

        <Button onClick={openCreateDialog}>Add product</Button>
      </div>

      {/* Single Card showing Total Products and Low Stock in header */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <PackageSearch className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold">Total Products</span>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {stats.total}
              </Badge>
            </div>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={openLowStockPopup}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 hover:bg-destructive/20 transition-colors">
                <Boxes className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Low Stock</span>
                <Badge variant="destructive" className="ml-1">
                  {stats.lowStock}
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Detergent product catalog</CardTitle>
            <p className="text-sm text-muted-foreground">
              Categories include powder detergent, liquid detergent, bar soap,
              dishwashing liquid, and fabric softener.
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-[1fr_180px_180px_180px_auto]">
            <Input
              placeholder="Search product, SKU, or barcode"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && runSearch()}
            />

            <Select
              value={categoryId}
              onValueChange={(value) => {
                setPage(1);
                setCategoryId(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {DEFAULT_PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={supplierId}
              onValueChange={(value) => {
                setPage(1);
                setSupplierId(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={String(supplier.id)}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={active}
              onValueChange={(value: 'all' | '1' | '0') => {
                setPage(1);
                setActive(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="1">Active</SelectItem>
                <SelectItem value="0">Inactive</SelectItem>
              </SelectContent>
            </Select>

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
                  <TableHead>Supplier</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock / Reorder</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {productsQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>Loading products...</TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>No products found.</TableCell>
                  </TableRow>
                ) : (
                  rows.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          SKU: {product.sku}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.barcode
                            ? `Barcode: ${product.barcode}`
                            : 'No barcode'}{' '}
                          • {product.package_size ?? 'No package'} /{' '}
                          {product.unit_of_measure ?? 'unit'}
                        </div>
                      </TableCell>

                      <TableCell>{categoryName(product)}</TableCell>

                      <TableCell>{product.supplier?.name ?? '—'}</TableCell>

                      <TableCell>
                        {money(product.unit_price)}
                        <div className="text-xs text-muted-foreground">
                          Bulk tier ready
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>{stockOf(product).toLocaleString()} available</div>
                        <div className="text-xs text-muted-foreground">
                          Reorder:{' '}
                          {Number(product.reorder_level ?? 0).toLocaleString()}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={product.is_active ? 'default' : 'secondary'}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
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
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open actions</span>
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => openDetails(product)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => toggleProduct(product)}
                            >
                              <Power className="mr-2 h-4 w-4" />
                              {product.is_active ? 'Disable' : 'Enable'}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => removeProduct(product)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

      {/* Low Stock Popup Dialog - Beautiful shadcn/ui styled */}
      <Dialog open={lowStockPopupOpen} onOpenChange={setLowStockPopupOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="sticky top-0 z-10 px-6 py-4 border-b bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Boxes className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Low Stock Products</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Products that have reached or fallen below their reorder level
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setLowStockPopupOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="p-6">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-3 rounded-full bg-muted mb-3">
                  <Boxes className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No low stock products found.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All products have sufficient stock levels.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Product</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Supplier</TableHead>
                      <TableHead className="font-semibold">Current Stock</TableHead>
                      <TableHead className="font-semibold">Reorder Level</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            SKU: {product.sku}
                          </div>
                        </TableCell>

                        <TableCell>{categoryName(product)}</TableCell>

                        <TableCell>{product.supplier?.name ?? '—'}</TableCell>

                        <TableCell>
                          <Badge variant="destructive" className="font-semibold">
                            {stockOf(product).toLocaleString()} units
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline">
                            {Number(product.reorder_level ?? 0).toLocaleString()} units
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={product.is_active ? 'default' : 'secondary'}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setLowStockPopupOpen(false);
                                openDetails(product);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setLowStockPopupOpen(false);
                                openEditDialog(product);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter className="sticky bottom-0 px-6 py-4 border-t bg-background">
            <Button variant="outline" onClick={() => setLowStockPopupOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog - Beautiful shadcn/ui styled */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="sticky top-0 z-10 px-6 py-4 border-b bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <PackageSearch className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Product Details</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete information about this product
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setDetailsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selected && (
            <div>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-none border-b px-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="stock">Stock</TabsTrigger>
                </TabsList>

                <div className="p-6">
                  <TabsContent value="overview" className="mt-0 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Tags className="h-4 w-4 text-muted-foreground" />
                            Product Information
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Category</span>
                            <span className="font-medium">
                              {categoryName(selected)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Supplier</span>
                            <span className="font-medium">
                              {selected.supplier?.name ?? '—'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">SKU</span>
                            <span className="font-mono text-sm font-medium">
                              {selected.sku}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">Barcode</span>
                            <span className="font-mono text-sm">
                              {selected.barcode ?? '—'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Packaging</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Package size</span>
                            <span className="font-medium">
                              {selected.package_size ?? '—'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">Unit of measure</span>
                            <span className="font-medium">
                              {selected.unit_of_measure ?? '—'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="pricing" className="mt-0">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">Wholesale Pricing</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                          <span className="text-muted-foreground">Unit price</span>
                          <span className="text-2xl font-bold text-primary">
                            {money(selected.unit_price)}
                          </span>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                          <p>Tier prices are calculated in the UI unless you add a product_price_tiers backend table.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="stock" className="mt-0">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-base">Stock Summary</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Current stock</span>
                            <span className="text-xl font-semibold">
                              {stockOf(selected).toLocaleString()} units
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Reorder level</span>
                            <span className="font-medium">
                              {Number(selected.reorder_level ?? 0).toLocaleString()} units
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">Stock status</span>
                            <Badge
                              variant={
                                Number(selected.reorder_level ?? 0) > 0 &&
                                stockOf(selected) <= Number(selected.reorder_level ?? 0)
                                  ? 'destructive'
                                  : 'default'
                              }
                              className="px-3 py-1"
                            >
                              {Number(selected.reorder_level ?? 0) > 0 &&
                              stockOf(selected) <= Number(selected.reorder_level ?? 0)
                                ? '⚠️ Low stock'
                                : '✓ Available'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-base">Stock Movement</CardTitle>
                        </CardHeader>

                        <CardContent className="text-sm text-muted-foreground space-y-2">
                          <p>Stock quantity is calculated from warehouse stock movements:</p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Purchase orders</li>
                            <li>Sales orders</li>
                            <li>Stock transfers</li>
                            <li>Returns</li>
                            <li>Adjustments</li>
                            <li>Damages</li>
                          </ul>
                          <p className="mt-3 pt-2 border-t text-xs">
                            Use the Inventory module to manage stock changes.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}

          <DialogFooter className="sticky bottom-0 px-6 py-4 border-t bg-background">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>

            {selected && (
              <Button
                onClick={() => {
                  setDetailsOpen(false);
                  openEditDialog(selected);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit product' : 'Create product'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic info</TabsTrigger>
              <TabsTrigger value="pricing">Wholesale pricing</TabsTrigger>
              <TabsTrigger value="stock">Stock rules</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.product_category_id}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      product_category_id: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {DEFAULT_PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Supplier reference</Label>
                <Select
                  value={form.supplier_id}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      supplier_id: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="none">No supplier</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={String(supplier.id)}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Pearl Powder Detergent"
                />
              </div>

              <div className="space-y-2">
                <Label>SKU code</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.sku}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sku: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="POWDER-PD-5KG"
                  />
                  <Button type="button" variant="outline" onClick={generateSku}>
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Barcode</Label>
                <Input
                  value={form.barcode}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      barcode: event.target.value,
                    }))
                  }
                  placeholder="6290000000000"
                />
              </div>

              <div className="space-y-2">
                <Label>Package size</Label>
                <Input
                  value={form.package_size}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      package_size: event.target.value,
                    }))
                  }
                  placeholder="5KG Carton"
                />
              </div>

              <div className="space-y-2">
                <Label>Unit of measure</Label>
                <Select
                  value={form.unit_of_measure}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      unit_of_measure: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {DEFAULT_PACKAGE_UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-3">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      is_active: checked,
                    }))
                  }
                />
                <span className="text-sm">Active product</span>
              </label>
            </TabsContent>

            <TabsContent
              value="pricing"
              className="mt-4 grid gap-4 md:grid-cols-2"
            >
              <div className="space-y-2">
                <Label>Base wholesale unit price</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.unit_price}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      unit_price: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex items-end">
                <Button type="button" variant="outline" onClick={calculateTiers}>
                  Calculate suggested tiers
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Distributor tier price</Label>
                <Input
                  type="number"
                  value={form.tier_distributor}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      tier_distributor: event.target.value,
                    }))
                  }
                  placeholder="Optional UI tier"
                />
              </div>

              <div className="space-y-2">
                <Label>Wholesale tier price</Label>
                <Input
                  type="number"
                  value={form.tier_wholesale}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      tier_wholesale: event.target.value,
                    }))
                  }
                  placeholder="Optional UI tier"
                />
              </div>

              <div className="space-y-2">
                <Label>Bulk tier price</Label>
                <Input
                  type="number"
                  value={form.tier_bulk}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      tier_bulk: event.target.value,
                    }))
                  }
                  placeholder="Optional UI tier"
                />
              </div>

              <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground md:col-span-2">
                Your current backend product table stores one unit_price. These
                tier fields are included in the frontend workflow as suggested
                wholesale tiers; add a product_price_tiers backend table when
                you want these saved permanently.
              </p>
            </TabsContent>

            <TabsContent value="stock" className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Reorder level</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.reorder_level}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      reorder_level: event.target.value,
                    }))
                  }
                />
              </div>

              <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground md:col-span-2">
                Stock quantity is calculated from warehouse stock movements:
                purchase, sale, transfer, return, adjustment, and damage. Use
                the Inventory module to manage stock changes.
              </p>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={submitProduct}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? 'Save changes' : 'Create product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}