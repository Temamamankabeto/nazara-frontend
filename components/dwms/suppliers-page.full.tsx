'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Phone,
  Power,
  Search,
  Trash2,
  Truck,
  WalletCards,
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
import { Textarea } from '@/components/ui/textarea';

import { useBranchesQuery } from '@/queries/branch.queries';
import {
  useSupplierBalancesQuery,
  useSupplierLedgerQuery,
  useSuppliersQuery,
} from '@/queries/supplier.queries';

import {
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useToggleSupplierStatusMutation,
  useUpdateSupplierMutation,
} from '@/hooks/use-suppliers';

import type { SupplierFormPayload, SupplierRow } from '@/types/supplier.types';

const initialForm = {
  branch_id: 'none',
  name: '',
  phone: '',
  email: '',
  address: '',
  contact_person: '',
  agreement_reference: '',
  opening_balance: '0',
  is_active: true,
};

function money(value: number | string | null | undefined) {
  return `${Number(value ?? 0).toLocaleString()} ETB`;
}

export default function SuppliersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<'all' | '1' | '0'>('all');

  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editing, setEditing] = useState<SupplierRow | null>(null);
  const [selected, setSelected] = useState<SupplierRow | null>(null);

  const [form, setForm] = useState(initialForm);

  const suppliersQuery = useSuppliersQuery({
    page,
    per_page: 10,
    search,
    active,
  });

  const branchesQuery = useBranchesQuery({ per_page: 100 });
  const balancesQuery = useSupplierBalancesQuery();
  const ledgerQuery = useSupplierLedgerQuery(selected?.id);

  const createMutation = useCreateSupplierMutation();
  const updateMutation = useUpdateSupplierMutation();
  const toggleMutation = useToggleSupplierStatusMutation();
  const deleteMutation = useDeleteSupplierMutation();

  const rows = suppliersQuery.data?.data ?? [];
  const branches = branchesQuery.data?.data ?? [];
  const meta = suppliersQuery.data?.meta ?? {
    current_page: page,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

  const balances = balancesQuery.data?.data ?? [];
  const ledgerRows = ledgerQuery.data?.data ?? [];

  const balanceBySupplier = useMemo(
    () =>
      new Map(
        balances.map((row) => [
          String(row.supplier_id),
          Number(row.balance ?? 0),
        ])
      ),
    [balances]
  );

  const stats = useMemo(
    () => ({
      total: meta.total,
      active: rows.filter((row) => row.is_active).length,
      agreements: rows.filter((row) => row.agreement_reference).length,
      balances: balances.reduce(
        (sum, row) => sum + Number(row.balance ?? 0),
        0
      ),
    }),
    [rows, meta.total, balances]
  );

  function runSearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  function openCreateDialog() {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  }

  function openEditDialog(supplier: SupplierRow) {
    setEditing(supplier);
    setForm({
      branch_id: supplier.branch_id ? String(supplier.branch_id) : 'none',
      name: supplier.name ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
      contact_person: supplier.contact_person ?? '',
      agreement_reference: supplier.agreement_reference ?? '',
      opening_balance: String(supplier.opening_balance ?? 0),
      is_active: supplier.is_active ?? true,
    });
    setOpen(true);
  }

  function openDetails(supplier: SupplierRow) {
    setSelected(supplier);
    setDetailsOpen(true);
  }

  async function submitSupplier() {
    const payload: SupplierFormPayload = {
      branch_id: form.branch_id === 'none' ? null : Number(form.branch_id),
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      contact_person: form.contact_person || null,
      agreement_reference: form.agreement_reference || null,
      opening_balance: Number(form.opening_balance || 0),
      is_active: form.is_active,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          payload,
        });
        toast.success('Supplier updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Supplier registered successfully');
      }

      setOpen(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Could not save supplier'
      );
    }
  }

  async function toggleSupplier(supplier: SupplierRow) {
    try {
      await toggleMutation.mutateAsync(supplier.id);
      toast.success('Supplier status updated');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Could not update supplier'
      );
    }
  }

  async function removeSupplier(supplier: SupplierRow) {
    if (!confirm(`Delete supplier ${supplier.name}?`)) return;

    try {
      await deleteMutation.mutateAsync(supplier.id);
      toast.success('Supplier deleted');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Could not delete supplier'
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Supplier Management</h1>
          <p className="text-sm text-muted-foreground">
            Register suppliers, contacts, agreement references, deliveries,
            purchase history, and balances.
          </p>
        </div>

        <Button onClick={openCreateDialog}>Register supplier</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4" />
              Suppliers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active on page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              Agreements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agreements}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <WalletCards className="h-4 w-4" />
              Supplier balances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{money(stats.balances)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Supplier directory</CardTitle>
            <p className="text-sm text-muted-foreground">
              Backend routes: /suppliers, /ledgers/suppliers,
              /reports/supplier-balances.
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-[1fr_180px_auto]">
            <Input
              placeholder="Search name, phone, email, contact person"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && runSearch()}
            />

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
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Agreement</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {suppliersQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>Loading suppliers...</TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>No suppliers found.</TableCell>
                  </TableRow>
                ) : (
                  rows.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Opening: {money(supplier.opening_balance)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>{supplier.contact_person ?? '—'}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {supplier.phone ?? 'No phone'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {supplier.email ?? 'No email'}
                        </div>
                      </TableCell>

                      <TableCell>
                        {supplier.agreement_reference ? (
                          <Badge variant="secondary">
                            {supplier.agreement_reference}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>

                      <TableCell>{supplier.branch?.name ?? '—'}</TableCell>

                      <TableCell>
                        {money(
                          balanceBySupplier.get(String(supplier.id)) ??
                            supplier.opening_balance
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={supplier.is_active ? 'default' : 'secondary'}
                        >
                          {supplier.is_active ? 'Active' : 'Inactive'}
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

                            <DropdownMenuItem
                              onClick={() => openDetails(supplier)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => openEditDialog(supplier)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => toggleSupplier(supplier)}
                            >
                              <Power className="mr-2 h-4 w-4" />
                              {supplier.is_active ? 'Disable' : 'Enable'}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => removeSupplier(supplier)}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit supplier' : 'Register supplier'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Supplier name</Label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Pearl Chemical Distributor"
              />
            </div>

            <div className="space-y-2">
              <Label>Branch</Label>
              <Select
                value={form.branch_id}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    branch_id: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="none">Use my branch/default</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Contact person</Label>
              <Input
                value={form.contact_person}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    contact_person: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Agreement reference</Label>
              <Input
                value={form.agreement_reference}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    agreement_reference: event.target.value,
                  }))
                }
                placeholder="AGR-2026-001"
              />
            </div>

            <div className="space-y-2">
              <Label>Opening balance</Label>
              <Input
                type="number"
                min="0"
                value={form.opening_balance}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    opening_balance: event.target.value,
                  }))
                }
              />
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
              <span className="text-sm">Active supplier</span>
            </label>

            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Textarea
                value={form.address}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                placeholder="Supplier address"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={submitSupplier}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? 'Save changes' : 'Register supplier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
  <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center justify-between gap-3">
        <span>{selected?.name ?? 'Supplier'} Details</span>
        <Badge variant={selected?.is_active ? 'default' : 'secondary'}>
          {selected?.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </DialogTitle>
    </DialogHeader>

    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="ledger">Ledger</TabsTrigger>
        <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Contact person</span>
                <span className="font-medium">{selected?.contact_person ?? '—'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{selected?.phone ?? '—'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{selected?.email ?? '—'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Branch</span>
                <span className="font-medium">{selected?.branch?.name ?? '—'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Agreement</span>
                <span className="font-medium">{selected?.agreement_reference ?? '—'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Opening balance</span>
                <span className="font-medium">{money(selected?.opening_balance)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Current balance</span>
                <span className="font-semibold">
                  {money(
                    selected
                      ? balanceBySupplier.get(String(selected.id)) ??
                          selected.opening_balance
                      : 0
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {selected?.address ?? '—'}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="ledger" className="mt-4">
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Debit</TableHead>
                <TableHead>Credit</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {ledgerQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>Loading balance history...</TableCell>
                </TableRow>
              ) : ledgerRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No ledger entries found.</TableCell>
                </TableRow>
              ) : (
                ledgerRows.map((row, index) => (
                  <TableRow key={row.id ?? index}>
                    <TableCell>{row.entry_date ?? '—'}</TableCell>
                    <TableCell>{row.entry_type ?? '—'}</TableCell>
                    <TableCell>{row.document_number ?? '—'}</TableCell>
                    <TableCell>{money(row.debit)}</TableCell>
                    <TableCell>{money(row.credit)}</TableCell>
                    <TableCell className="font-medium">
                      {money(row.balance_after)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="deliveries" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Supplier Deliveries</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Supplier deliveries are tracked through Purchase Orders and Stock
            Receiving. Open the Purchase Orders module to view received,
            partially received, and pending deliveries for this supplier.
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <DialogFooter>
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
          Edit Supplier
        </Button>
      )}
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}