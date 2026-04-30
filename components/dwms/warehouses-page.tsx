'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search, Warehouse, Edit, Trash2, MapPin, User, Building2, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCreateWarehouseMutation, useDeleteWarehouseMutation, useUpdateWarehouseMutation } from '@/hooks/use-warehouses';
import { useBranchesQuery } from '@/queries/branch.queries';
import { useWarehousesQuery } from '@/queries/warehouse.queries';
import type { WarehouseFormPayload, WarehouseRow } from '@/types/warehouse.types';

const initialForm = { branch_id: 'none', name: '', code: '', location: '', manager_name: '', is_active: true };

export default function WarehousesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [branchId, setBranchId] = useState<string>('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WarehouseRow | null>(null);
  const [form, setForm] = useState(initialForm);

  const warehousesQuery = useWarehousesQuery({ page, per_page: 10, search, branch_id: branchId });
  const branchesQuery = useBranchesQuery({ per_page: 100 });
  const createMutation = useCreateWarehouseMutation();
  const updateMutation = useUpdateWarehouseMutation();
  const deleteMutation = useDeleteWarehouseMutation();

  const rows = warehousesQuery.data?.data ?? [];
  const branches = branchesQuery.data?.data ?? [];
  const meta = warehousesQuery.data?.meta ?? { current_page: page, per_page: 10, total: 0, last_page: 1 };

  const stats = useMemo(
    () => ({
      total: meta.total,
      active: rows.filter((row) => row.is_active).length,
      inactive: rows.filter((row) => !row.is_active).length,
    }),
    [rows, meta.total]
  );

  function openCreateDialog() {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  }

  function openEditDialog(warehouse: WarehouseRow) {
    setEditing(warehouse);
    setForm({
      branch_id: warehouse.branch_id ? String(warehouse.branch_id) : 'none',
      name: warehouse.name ?? '',
      code: warehouse.code ?? '',
      location: warehouse.location ?? '',
      manager_name: warehouse.manager_name ?? '',
      is_active: warehouse.is_active ?? true,
    });
    setOpen(true);
  }

  async function submitWarehouse() {
    const payload: WarehouseFormPayload = {
      branch_id: form.branch_id === 'none' ? null : Number(form.branch_id),
      name: form.name,
      code: form.code,
      location: form.location || null,
      manager_name: form.manager_name || null,
      is_active: form.is_active,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
        toast.success('Warehouse updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Warehouse created successfully');
      }
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.message ?? 'Could not save warehouse');
    }
  }

  async function removeWarehouse(warehouse: WarehouseRow) {
    if (!confirm(`Delete ${warehouse.name}?`)) return;
    try {
      await deleteMutation.mutateAsync(warehouse.id);
      toast.success('Warehouse deleted');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.message ?? 'Could not delete warehouse');
    }
  }

  function runSearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Warehouses</h1>
          <p className="text-sm text-muted-foreground">
            Manage detergent stock locations by branch, code, location, and responsible manager.
          </p>
        </div>
        <Button onClick={openCreateDialog}>Add warehouse</Button>
      </div>

      {/* Single Card showing Total Warehouses and stats in header */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold">Total Warehouses</span>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {stats.total}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Active</span>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30">
                  {stats.active}
                </Badge>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-950/20">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Inactive</span>
                <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30">
                  {stats.inactive}
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Warehouse list</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your storage locations and their assigned managers
            </p>
          </div>
          <div className="grid gap-2 md:grid-cols-[1fr_220px_auto]">
            <Input 
              placeholder="Search warehouse name or code" 
              value={searchInput} 
              onChange={(event) => setSearchInput(event.target.value)} 
              onKeyDown={(event) => event.key === 'Enter' && runSearch()} 
            />
            <Select value={branchId} onValueChange={(value) => { setPage(1); setBranchId(value); }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={String(branch.id)}>{branch.name}</SelectItem>
                ))}
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
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehousesQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>Loading warehouses...</TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>No warehouses found.</TableCell>
                  </TableRow>
                ) : (
                  rows.map((warehouse) => (
                    <TableRow key={warehouse.id}>
                      <TableCell>
                        <div className="font-medium">{warehouse.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Code: {warehouse.code}
                        </div>
                      </TableCell>
                      <TableCell>
                        {warehouse.branch?.name ? (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{warehouse.branch.name}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {warehouse.location ? (
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{warehouse.location}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {warehouse.manager_name ? (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{warehouse.manager_name}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={warehouse.is_active ? 'default' : 'secondary'}
                          className={warehouse.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                        >
                          {warehouse.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(warehouse)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit warehouse
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => removeWarehouse(warehouse)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete warehouse
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
            <span>Page {meta.current_page} of {meta.last_page}</span>
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

      {/* Warehouse Create/Edit Dialog - Beautiful shadcn/ui styled */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="sticky top-0 z-10 px-6 py-4 border-b bg-background">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Warehouse className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {editing ? 'Edit warehouse' : 'Create warehouse'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {editing ? 'Update warehouse information' : 'Add a new warehouse location to the system'}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Branch *</Label>
                <Select value={form.branch_id} onValueChange={(value) => setForm((current) => ({ ...current, branch_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Current user branch</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={String(branch.id)}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Warehouse code *</Label>
                <Input 
                  value={form.code} 
                  onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} 
                  placeholder="WH-001" 
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier for this warehouse
                </p>
              </div>

              <div className="space-y-2">
                <Label>Warehouse name *</Label>
                <Input 
                  value={form.name} 
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} 
                  placeholder="Main detergent warehouse" 
                />
              </div>

              <div className="space-y-2">
                <Label>Manager name</Label>
                <Input 
                  value={form.manager_name} 
                  onChange={(event) => setForm((current) => ({ ...current, manager_name: event.target.value }))} 
                  placeholder="John Doe" 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Location</Label>
                <Input 
                  value={form.location} 
                  onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} 
                  placeholder="City, District, Street address" 
                />
                <p className="text-xs text-muted-foreground">
                  Physical address of the warehouse
                </p>
              </div>

              <div className="flex items-center space-x-3 md:col-span-2 pt-2">
                <Switch 
                  checked={form.is_active} 
                  onCheckedChange={(checked) => setForm((current) => ({ ...current, is_active: checked }))} 
                />
                <div>
                  <Label className="cursor-pointer">Active warehouse</Label>
                  <p className="text-xs text-muted-foreground">
                    Inactive warehouses won't appear in selection lists
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 px-6 py-4 border-t bg-background">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitWarehouse} 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? 'Save changes' : 'Create warehouse'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}