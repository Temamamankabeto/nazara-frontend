"use client";

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
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
  X,
  Users,
  Building2,
  DollarSign,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { useBranchesQuery } from "@/queries/branch.queries";
import type { RootState } from "@/stores";
import { getPrimaryRole, normalizeRole } from "@/lib/role-access";
import {
  useSupplierBalancesQuery,
  useSupplierLedgerQuery,
  useSuppliersQuery,
} from "@/queries/supplier.queries";

import {
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useToggleSupplierStatusMutation,
  useUpdateSupplierMutation,
} from "@/hooks/use-suppliers";

import type { SupplierFormPayload, SupplierRow } from "@/types/supplier.types";

const initialForm = {
  branch_id: "none",
  name: "",
  phone: "",
  email: "",
  address: "",
  contact_person: "",
  is_active: true,
};

function money(value: number | string | null | undefined) {
  return `${Number(value ?? 0).toLocaleString()} ETB`;
}

export default function SuppliersPage() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isGeneralAdministrator =
    normalizeRole(getPrimaryRole(currentUser)) === "General Administrator";
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<"all" | "1" | "0">("all");

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
        ]),
      ),
    [balances],
  );

  const stats = useMemo(
    () => ({
      total: meta.total,
      active: rows.filter((row) => row.is_active).length,
      balances: balances.reduce(
        (sum, row) => sum + Number(row.balance ?? 0),
        0,
      ),
    }),
    [rows, meta.total, balances],
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
      branch_id: supplier.branch_id ? String(supplier.branch_id) : "none",
      name: supplier.name ?? "",
      phone: supplier.phone ?? "",
      email: supplier.email ?? "",
      address: supplier.address ?? "",
      contact_person: supplier.contact_person ?? "",
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
      ...(isGeneralAdministrator
        ? {
            branch_id:
              form.branch_id === "none" ? null : Number(form.branch_id),
          }
        : {}),
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      contact_person: form.contact_person || null,
      is_active: form.is_active,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          payload,
        });
        toast.success("Supplier updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Supplier registered successfully");
      }

      setOpen(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Could not save supplier",
      );
    }
  }

  async function toggleSupplier(supplier: SupplierRow) {
    try {
      await toggleMutation.mutateAsync(supplier.id);
      toast.success("Supplier status updated");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Could not update supplier",
      );
    }
  }

  async function removeSupplier(supplier: SupplierRow) {
    if (!confirm(`Delete supplier ${supplier.name}?`)) return;

    try {
      await deleteMutation.mutateAsync(supplier.id);
      toast.success("Supplier deleted");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Could not delete supplier",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Supplier Management</h1>
          <p className="text-sm text-muted-foreground">
            Register and manage suppliers, contacts, deliveries, purchase
            history, and balances.
          </p>
        </div>

        <Button onClick={openCreateDialog}>Register supplier</Button>
      </div>

      {/* Single Card showing Total Suppliers and other stats in header */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold">Total Suppliers</span>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {stats.total}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-950/20">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Active
                </span>
                <Badge
                  variant="outline"
                  className="bg-green-100 dark:bg-green-900/30"
                >
                  {stats.active}
                </Badge>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-50 dark:bg-purple-950/20">
                <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Total Balance
                </span>
                <Badge
                  variant="outline"
                  className="bg-purple-100 dark:bg-purple-900/30"
                >
                  {money(stats.balances)}
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="shadow-sm">
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
              onKeyDown={(event) => event.key === "Enter" && runSearch()}
            />

            <Select
              value={active}
              onValueChange={(value: "all" | "1" | "0") => {
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
                  <TableHead>Branch</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {suppliersQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>Loading suppliers...</TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>No suppliers found.</TableCell>
                  </TableRow>
                ) : (
                  rows.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="font-medium">{supplier.name}</div>
                      </TableCell>

                      <TableCell>
                        <div>{supplier.contact_person ?? "—"}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {supplier.phone ?? "No phone"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {supplier.email ?? "No email"}
                        </div>
                      </TableCell>

                      <TableCell>{supplier.branch?.name ?? "—"}</TableCell>

                      <TableCell>
                        <Badge variant="outline" className="font-semibold">
                          {money(
                            balanceBySupplier.get(String(supplier.id)) ?? 0,
                          )}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={supplier.is_active ? "default" : "secondary"}
                        >
                          {supplier.is_active ? "Active" : "Inactive"}
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
                              {supplier.is_active ? "Disable" : "Enable"}
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

      {/* Supplier Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="sticky top-0 z-10 px-6 py-4 border-b bg-background">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {editing ? "Edit supplier" : "Register supplier"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {editing
                    ? "Update the supplier profile and contact information."
                    : isGeneralAdministrator
                      ? "Add a supplier and assign the appropriate branch."
                      : "The supplier will automatically be registered under your assigned branch."}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Supplier name *</Label>
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

              {isGeneralAdministrator && (
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select
                    value={form.branch_id}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, branch_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No branch</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={String(branch.id)}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                  placeholder="John Doe"
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
                  placeholder="+251 911 123456"
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
                  placeholder="supplier@example.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      is_active: checked,
                    }))
                  }
                />
                <Label className="cursor-pointer">Active supplier</Label>
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
                  placeholder="Supplier address"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 px-6 py-4 border-t bg-background">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={submitSupplier}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? "Save changes" : "Register supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier Details Dialog - Beautiful shadcn/ui styled */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="sticky top-0 z-10 px-6 py-4 border-b bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl">
                    Supplier Details
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete information about this supplier
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={selected?.is_active ? "default" : "secondary"}
                  className="px-3 py-1"
                >
                  {selected?.is_active ? "Active" : "Inactive"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDetailsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {selected && (
            <div>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-none border-b px-6">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="ledger">Ledger</TabsTrigger>
                  <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
                </TabsList>

                <div className="p-6">
                  <TabsContent value="profile" className="mt-0">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">
                              Contact person
                            </span>
                            <span className="font-medium">
                              {selected.contact_person ?? "—"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">Phone</span>
                            <span className="font-medium">
                              {selected.phone ?? "—"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">
                              {selected.email ?? "—"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <WalletCards className="h-4 w-4 text-muted-foreground" />
                            Business Information
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">
                              Branch
                            </span>
                            <span className="font-medium">
                              {selected.branch?.name ?? "—"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground">
                              Current balance
                            </span>
                            <span className="text-lg font-bold text-primary">
                              {money(
                                balanceBySupplier.get(String(selected.id)) ?? 0,
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="md:col-span-2 shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Address</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="p-3 rounded-lg bg-muted/50 text-sm">
                            {selected.address ?? "No address provided"}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="ledger" className="mt-0">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Supplier Ledger History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg border">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="font-semibold">
                                  Date
                                </TableHead>
                                <TableHead className="font-semibold">
                                  Type
                                </TableHead>
                                <TableHead className="font-semibold">
                                  Document
                                </TableHead>
                                <TableHead className="font-semibold text-right">
                                  Debit
                                </TableHead>
                                <TableHead className="font-semibold text-right">
                                  Credit
                                </TableHead>
                                <TableHead className="font-semibold text-right">
                                  Balance
                                </TableHead>
                              </TableRow>
                            </TableHeader>

                            <TableBody>
                              {ledgerQuery.isLoading ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={6}
                                    className="text-center"
                                  >
                                    Loading balance history...
                                  </TableCell>
                                </TableRow>
                              ) : ledgerRows.length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={6}
                                    className="text-center text-muted-foreground"
                                  >
                                    No ledger entries found.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                ledgerRows.map((row, index) => (
                                  <TableRow key={row.id ?? index}>
                                    <TableCell>
                                      {row.entry_date ?? "—"}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {row.entry_type ?? "—"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                      {row.document_number ?? "—"}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600 dark:text-green-400">
                                      {money(row.debit)}
                                    </TableCell>
                                    <TableCell className="text-right text-red-600 dark:text-red-400">
                                      {money(row.credit)}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      {money(row.balance_after)}
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="deliveries" className="mt-0">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Supplier Deliveries
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-6 rounded-lg bg-muted/50 text-center">
                          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">
                            Supplier deliveries are tracked through Purchase
                            Orders and Stock Receiving.
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Open the Purchase Orders module to view received,
                            partially received, and pending deliveries for this
                            supplier.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
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
                Edit Supplier
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
