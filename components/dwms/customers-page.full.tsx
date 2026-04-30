'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CreditCard, MapPin, Search, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCustomerMutation, useDeleteCustomerMutation, useUpdateCustomerMutation } from '@/hooks/use-customers';
import { useCustomerBalancesQuery, useCustomersQuery } from '@/queries/customer.queries';
import { useBranchesQuery } from '@/queries/branch.queries';
import { CUSTOMER_PRICE_LEVELS, CUSTOMER_TYPES, type CustomerFormPayload, type CustomerRow } from '@/types/customer.types';

const initialForm = { branch_id: 'none', name: '', phone: '', email: '', region: '', address: '', customer_type: 'distributor', price_level: 'standard', credit_limit: '0', opening_balance: '0', is_active: true };

function money(value: number | string | null | undefined) {
  return `${Number(value ?? 0).toLocaleString()} ETB`;
}

function typeLabel(value?: string | null) {
  return CUSTOMER_TYPES.find((type) => type.value === value)?.label ?? value ?? '—';
}

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [customerType, setCustomerType] = useState('all');
  const [branchId, setBranchId] = useState('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [form, setForm] = useState(initialForm);

  const customersQuery = useCustomersQuery({ page, per_page: 10, search, customer_type: customerType, branch_id: branchId });
  const branchesQuery = useBranchesQuery({ per_page: 100 });
  const balancesQuery = useCustomerBalancesQuery();
  const createMutation = useCreateCustomerMutation();
  const updateMutation = useUpdateCustomerMutation();
  const deleteMutation = useDeleteCustomerMutation();

  const rows = customersQuery.data?.data ?? [];
  const branches = branchesQuery.data?.data ?? [];
  const meta = customersQuery.data?.meta ?? { current_page: page, per_page: 10, total: 0, last_page: 1 };
  const balancesByCustomer = useMemo(() => new Map((balancesQuery.data?.data ?? []).map((row) => [String(row.customer_id), Number(row.balance ?? 0)])), [balancesQuery.data]);
  const pageBalance = rows.reduce((sum, row) => sum + (balancesByCustomer.get(String(row.id)) ?? Number(row.opening_balance ?? 0)), 0);
  const pageCredit = rows.reduce((sum, row) => sum + Number(row.credit_limit ?? 0), 0);

  function openCreateDialog() {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  }

  function openEditDialog(customer: CustomerRow) {
    setEditing(customer);
    setForm({
      branch_id: customer.branch_id ? String(customer.branch_id) : 'none',
      name: customer.name ?? '',
      phone: customer.phone ?? '',
      email: customer.email ?? '',
      region: customer.region ?? '',
      address: customer.address ?? '',
      customer_type: customer.customer_type ?? 'distributor',
      price_level: customer.price_level ?? 'standard',
      credit_limit: String(customer.credit_limit ?? '0'),
      opening_balance: String(customer.opening_balance ?? '0'),
      is_active: customer.is_active ?? true,
    });
    setOpen(true);
  }

  async function submitCustomer() {
    const payload: CustomerFormPayload = {
      branch_id: form.branch_id === 'none' ? null : Number(form.branch_id),
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      region: form.region || null,
      address: form.address || null,
      customer_type: form.customer_type,
      price_level: form.price_level || null,
      credit_limit: Number(form.credit_limit || 0),
      opening_balance: Number(form.opening_balance || 0),
      is_active: form.is_active,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
        toast.success('Customer updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Customer created successfully');
      }
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.message ?? 'Could not save customer');
    }
  }

  async function removeCustomer(customer: CustomerRow) {
    if (!confirm(`Delete ${customer.name}?`)) return;
    try {
      await deleteMutation.mutateAsync(customer.id);
      toast.success('Customer deleted');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.message ?? 'Could not delete customer');
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
          <h1 className="text-2xl font-semibold">Customers & Distributors</h1>
          <p className="text-sm text-muted-foreground">Register distributors, retailers, supermarkets, institutions, price levels, balances, credit limits, and customer regions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild><Link href="/customers/regions"><MapPin className="mr-2 h-4 w-4" />Regions</Link></Button>
          <Button variant="outline" asChild><Link href="/customers/balances"><CreditCard className="mr-2 h-4 w-4" />Balances</Link></Button>
          <Button onClick={openCreateDialog}>Add customer</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><UsersRound className="h-4 w-4" /> Total customers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{meta.total}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active on page</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{rows.filter((row) => row.is_active).length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Credit limit on page</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{money(pageCredit)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Balance on page</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{money(pageBalance)}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div><CardTitle>Customer directory</CardTitle><p className="text-sm text-muted-foreground">Backend endpoint: /customers, /reports/customer-balances, /ledgers/customers.</p></div>
          <div className="grid gap-2 md:grid-cols-[1fr_200px_200px_auto]">
            <Input placeholder="Search name, phone, email, or region" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && runSearch()} />
            <Select value={customerType} onValueChange={(value) => { setPage(1); setCustomerType(value); }}><SelectTrigger><SelectValue placeholder="Customer type" /></SelectTrigger><SelectContent><SelectItem value="all">All customer types</SelectItem>{CUSTOMER_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent></Select>
            <Select value={branchId} onValueChange={(value) => { setPage(1); setBranchId(value); }}><SelectTrigger><SelectValue placeholder="Branch" /></SelectTrigger><SelectContent><SelectItem value="all">All branches</SelectItem>{branches.map((branch) => <SelectItem key={branch.id} value={String(branch.id)}>{branch.name}</SelectItem>)}</SelectContent></Select>
            <Button variant="outline" onClick={runSearch}><Search className="mr-2 h-4 w-4" />Search</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Category</TableHead><TableHead>Region</TableHead><TableHead>Price level</TableHead><TableHead>Credit limit</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {customersQuery.isLoading ? <TableRow><TableCell colSpan={8}>Loading customers...</TableCell></TableRow> : rows.length === 0 ? <TableRow><TableCell colSpan={8}>No customers found.</TableCell></TableRow> : rows.map((customer) => {
                const balance = balancesByCustomer.get(String(customer.id)) ?? Number(customer.opening_balance ?? 0);
                return (
                  <TableRow key={customer.id}>
                    <TableCell><div className="font-medium">{customer.name}</div><div className="text-xs text-muted-foreground">{customer.phone || 'No phone'} {customer.email ? `• ${customer.email}` : ''}<br />{customer.branch?.name ?? 'No branch'}</div></TableCell>
                    <TableCell>{typeLabel(customer.customer_type)}</TableCell>
                    <TableCell>{customer.region ?? '—'}</TableCell>
                    <TableCell>{customer.price_level ?? 'standard'}</TableCell>
                    <TableCell>{money(customer.credit_limit)}</TableCell>
                    <TableCell>{money(balance)}</TableCell>
                    <TableCell><Badge variant={customer.is_active ? 'default' : 'secondary'}>{customer.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="outline" size="sm" asChild><Link href={`/customers/${customer.id}`}>View</Link></Button><Button variant="outline" size="sm" onClick={() => openEditDialog(customer)}>Edit</Button><Button variant="destructive" size="sm" onClick={() => removeCustomer(customer)}>Delete</Button></div></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground"><span>Page {meta.current_page} of {meta.last_page}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit customer' : 'Create customer'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Branch</Label><Select value={form.branch_id} onValueChange={(value) => setForm((current) => ({ ...current, branch_id: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Use my branch / no branch</SelectItem>{branches.map((branch) => <SelectItem key={branch.id} value={String(branch.id)}>{branch.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Customer category</Label><Select value={form.customer_type} onValueChange={(value) => setForm((current) => ({ ...current, customer_type: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CUSTOMER_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Alem Distributor" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="09..." /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></div>
            <div className="space-y-2"><Label>Region</Label><Input value={form.region} onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))} placeholder="Addis Ababa" /></div>
            <div className="space-y-2"><Label>Price level</Label><Select value={form.price_level} onValueChange={(value) => setForm((current) => ({ ...current, price_level: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CUSTOMER_PRICE_LEVELS.map((level) => <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Credit limit</Label><Input type="number" min="0" value={form.credit_limit} onChange={(event) => setForm((current) => ({ ...current, credit_limit: event.target.value }))} /></div>
            <div className="space-y-2"><Label>Opening balance</Label><Input type="number" value={form.opening_balance} onChange={(event) => setForm((current) => ({ ...current, opening_balance: event.target.value }))} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Address</Label><Textarea value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} placeholder="Customer address" /></div>
            <label className="flex items-center gap-3 md:col-span-2"><Switch checked={form.is_active} onCheckedChange={(checked) => setForm((current) => ({ ...current, is_active: checked }))} /><span className="text-sm">Active customer</span></label>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submitCustomer} disabled={createMutation.isPending || updateMutation.isPending}>{editing ? 'Save changes' : 'Create customer'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
