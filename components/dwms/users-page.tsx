'use client';

import { useMemo, useState } from 'react';
import { Edit, MoreHorizontal, Power, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  useBranchesQuery,
  useRolesLiteQuery,
  useUsersQuery,
} from '@/queries/user-management.queries';

import {
  useAssignUserRoleMutation,
  useCreateUserMutation,
  useResetUserPasswordMutation,
  useToggleUserStatusMutation,
  useUpdateUserMutation,
} from '@/hooks/use-user-management';

import type {
  UserFormPayload,
  UserRow,
  UserStatusFilter,
} from '@/types/user-management.types';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  branch_id: '',
  role: '',
  password: '',
};

function getRoleName(user: UserRow) {
  const role = user.roles?.[0];
  return typeof role === 'string' ? role : role?.name ?? '—';
}

export default function DwmsUsersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<UserStatusFilter>('all');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form, setForm] = useState(initialForm);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetUser, setResetUser] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const filters = {
    page,
    per_page: 10,
    search,
    ...(status !== 'all' ? { status } : {}),
  };

  const usersQuery = useUsersQuery(filters);
  const rolesQuery = useRolesLiteQuery();
  const branchesQuery = useBranchesQuery();

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const assignRoleMutation = useAssignUserRoleMutation();
  const toggleMutation = useToggleUserStatusMutation();
  const resetPasswordMutation = useResetUserPasswordMutation();

  const rows = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta ?? {
    current_page: page,
    per_page: 10,
    total: 0,
    last_page: 1,
  };

  const roles = rolesQuery.data?.data ?? [];
  const branches = branchesQuery.data?.data ?? [];

  const summary = useMemo(
    () => ({
      total: meta.total,
      active: rows.filter((row) => row.is_active).length,
      disabled: rows.filter((row) => !row.is_active).length,
    }),
    [rows, meta.total]
  );

  function openCreateDialog() {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  }

  function openEditDialog(user: UserRow) {
    setEditing(user);

    setForm({
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      address: user.address ?? '',
      branch_id: String(user.branch_id ?? user.branch?.id ?? ''),
      role: getRoleName(user) === '—' ? '' : getRoleName(user),
      password: '',
    });

    setOpen(true);
  }

  async function submitUser() {
    const payload: UserFormPayload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      address: form.address || null,
      branch_id: form.branch_id ? Number(form.branch_id) : null,
      ...(form.role ? { role: form.role } : {}),
      ...(!editing && form.password ? { password: form.password } : {}),
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          payload,
        });

        if (form.role) {
          await assignRoleMutation.mutateAsync({
            id: editing.id,
            role: form.role,
          });
        }

        toast.success('User updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('User created successfully');
      }

      setOpen(false);
      setForm(initialForm);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Action failed'
      );
    }
  }

  async function toggleStatus(user: UserRow) {
    try {
      await toggleMutation.mutateAsync(user.id);
      toast.success('User status updated');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Could not update user status'
      );
    }
  }

  async function resetPassword() {
    if (!resetUser) return;

    try {
      await resetPasswordMutation.mutateAsync({
        id: resetUser.id,
        new_password: newPassword,
      });

      toast.success('Password reset successful');
      setResetOpen(false);
      setNewPassword('');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Could not reset password'
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage staff accounts, branch assignment, status, and role access for
            Pearl Detergent DWMS.
          </p>
        </div>

        <Button onClick={openCreateDialog}>Create user</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active on page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Disabled on page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.disabled}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff directory</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              placeholder="Search by name, email, or phone"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  setSearch(searchInput);
                  setPage(1);
                }
              }}
            />

            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as UserStatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearch(searchInput);
                setPage(1);
              }}
            >
              Apply
            </Button>
          </div>

          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {usersQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>Loading users...</TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>No users found.</TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.email}
                        </div>
                      </TableCell>

                      <TableCell>{getRoleName(row)}</TableCell>

                      <TableCell>{row.branch?.name ?? '—'}</TableCell>

                      <TableCell>{row.phone ?? '—'}</TableCell>

                      <TableCell>
                        <Badge
                          variant={row.is_active ? 'default' : 'secondary'}
                        >
                          {row.is_active ? 'Active' : 'Disabled'}
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
                              onClick={() => openEditDialog(row)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => toggleStatus(row)}
                            >
                              <Power className="mr-2 h-4 w-4" />
                              {row.is_active ? 'Disable' : 'Activate'}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                setResetUser(row);
                                setNewPassword('');
                                setResetOpen(true);
                              }}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Reset password
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

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Page {meta.current_page} of {meta.last_page}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit user' : 'Create user'}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(event) =>
                  setForm({ ...form, address: event.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm({ ...form, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>

                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Branch</Label>
              <Select
                value={form.branch_id || 'none'}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    branch_id: value === 'none' ? '' : value,
                  })
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

            {!editing && (
              <div className="space-y-2 md:col-span-2">
                <Label>Initial password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={submitUser}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? 'Save changes' : 'Create user'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Set a new password for {resetUser?.name}.
            </p>

            <div className="space-y-2">
              <Label>New password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={resetPassword}
              disabled={resetPasswordMutation.isPending || !newPassword}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}