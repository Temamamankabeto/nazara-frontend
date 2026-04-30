'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Building2, Edit, MoreHorizontal, Search, X, MapPin, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';

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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

import {
  useCreateBranchMutation,
  useUpdateBranchMutation,
} from '@/hooks/use-branches';
import { useBranchesQuery } from '@/queries/branch.queries';
import type { BranchFormPayload, BranchRow } from '@/types/branch.types';

const initialForm = {
  name: '',
  code: '',
  phone: '',
  email: '',
  address: '',
  is_active: true,
};

export default function BranchesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BranchRow | null>(null);
  const [form, setForm] = useState(initialForm);

  const filters = { page, per_page: 10, search };

  const branchesQuery = useBranchesQuery(filters);
  const createMutation = useCreateBranchMutation();
  const updateMutation = useUpdateBranchMutation();

  const rows = branchesQuery.data?.data ?? [];
  const meta = branchesQuery.data?.meta ?? {
    current_page: page,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

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

  function openEditDialog(branch: BranchRow) {
    setEditing(branch);
    setForm({
      name: branch.name ?? '',
      code: branch.code ?? '',
      phone: branch.phone ?? '',
      email: branch.email ?? '',
      address: branch.address ?? '',
      is_active: branch.is_active ?? true,
    });
    setOpen(true);
  }

  function runSearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function submitBranch() {
    const payload: BranchFormPayload = {
      name: form.name,
      code: form.code,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      is_active: form.is_active,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          payload,
        });
        toast.success('Branch updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Branch created successfully');
      }

      setOpen(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Could not save branch'
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Branches</h1>
          <p className="text-sm text-muted-foreground">
            Manage Pearl Detergent wholesale branches used by users, suppliers,
            warehouses, purchases, and sales.
          </p>
        </div>

        <Button onClick={openCreateDialog}>Add branch</Button>
      </div>

      {/* Single Card showing Total Branches and stats in header */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold">Total Branches</span>
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
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Branch list</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your business locations and their contact information
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Search name or code"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && runSearch()}
              className="w-[250px]"
            />
            <Button variant="outline" size="icon" onClick={runSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {branchesQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5}>Loading branches...</TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>No branches found.</TableCell>
                  </TableRow>
                ) : (
                  rows.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Code: {branch.code}
                        </div>
                      </TableCell>

                      <TableCell>
                        {branch.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {branch.phone}
                          </div>
                        )}
                        {branch.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Mail className="h-3 w-3" />
                            {branch.email}
                          </div>
                        )}
                        {!branch.phone && !branch.email && (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell className="max-w-[260px]">
                        {branch.address ? (
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{branch.address}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={branch.is_active ? 'default' : 'secondary'}
                          className={branch.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                        >
                          {branch.is_active ? 'Active' : 'Inactive'}
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

                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => openEditDialog(branch)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit branch
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

      {/* Branch Create/Edit Dialog - Beautiful shadcn/ui styled */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="sticky top-0 z-10 px-6 py-4 border-b bg-background">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {editing ? 'Edit branch' : 'Create branch'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {editing ? 'Update branch information' : 'Add a new branch location to the system'}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Branch name *</Label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Main Branch"
                />
              </div>

              <div className="space-y-2">
                <Label>Branch code *</Label>
                <Input
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="MAIN"
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier for this branch
                </p>
              </div>

              <div className="space-y-2">
                <Label>Phone number</Label>
                <Input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="+251 911 123456"
                />
              </div>

              <div className="space-y-2">
                <Label>Email address</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="branch@example.com"
                />
              </div>

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
                  placeholder="Full branch address"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-3 md:col-span-2 pt-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      is_active: checked,
                    }))
                  }
                />
                <div>
                  <Label className="cursor-pointer">Active branch</Label>
                  <p className="text-xs text-muted-foreground">
                    Inactive branches won't appear in selection lists
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
              onClick={submitBranch}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? 'Save changes' : 'Create branch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}