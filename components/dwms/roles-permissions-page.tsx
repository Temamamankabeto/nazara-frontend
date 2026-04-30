'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, KeyRound, Save, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissionsQuery, useRolePermissionsQuery, useRolesQuery } from '@/queries/role-management.queries';
import { useAssignRolePermissionsMutation, useCreatePermissionMutation, useCreateRoleMutation, useDeletePermissionMutation, useUpdatePermissionMutation, useUpdateRoleMutation } from '@/hooks/use-role-management';
import type { PermissionRow, RoleRow } from '@/types/role-management.types';

function groupPermissionName(name: string) {
  if (name.startsWith('reports.')) return 'reports';
  return name.split('.')[0] || 'general';
}

function readable(text: string) {
  return text.replace(/_/g, ' ').replace(/\./g, ' / ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function RolesPermissionsPage() {
  const [roleSearchInput, setRoleSearchInput] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [permissionSearchInput, setPermissionSearchInput] = useState('');
  const [permissionSearch, setPermissionSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null);
  const [checkedPermissions, setCheckedPermissions] = useState<string[]>([]);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRow | null>(null);
  const [editingPermission, setEditingPermission] = useState<PermissionRow | null>(null);
  const [name, setName] = useState('');

  const rolesQuery = useRolesQuery({ search: roleSearch });
  const permissionsQuery = usePermissionsQuery({ search: permissionSearch });
  const rolePermissionsQuery = useRolePermissionsQuery(selectedRole?.id ?? null);
  const createRoleMutation = useCreateRoleMutation();
  const updateRoleMutation = useUpdateRoleMutation();
  const createPermissionMutation = useCreatePermissionMutation();
  const updatePermissionMutation = useUpdatePermissionMutation();
  const deletePermissionMutation = useDeletePermissionMutation();
  const assignMutation = useAssignRolePermissionsMutation();

  const roles = rolesQuery.data?.data ?? [];
  const permissions = permissionsQuery.data?.data ?? [];

  useEffect(() => {
    if (!selectedRole && roles.length > 0) setSelectedRole(roles[0]);
  }, [roles, selectedRole]);

  useEffect(() => {
    setCheckedPermissions(rolePermissionsQuery.data?.data ?? []);
  }, [rolePermissionsQuery.data]);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, PermissionRow[]>>((groups, permission) => {
      const group = groupPermissionName(permission.name);
      groups[group] = groups[group] ?? [];
      groups[group].push(permission);
      return groups;
    }, {});
  }, [permissions]);

  function openRoleDialog(role?: RoleRow) {
    setEditingRole(role ?? null);
    setName(role?.name ?? '');
    setRoleDialogOpen(true);
  }

  function openPermissionDialog(permission?: PermissionRow) {
    setEditingPermission(permission ?? null);
    setName(permission?.name ?? '');
    setPermissionDialogOpen(true);
  }

  async function saveRole() {
    try {
      if (editingRole) await updateRoleMutation.mutateAsync({ id: editingRole.id, payload: { name } });
      else await createRoleMutation.mutateAsync({ name });
      toast.success(editingRole ? 'Role updated' : 'Role created');
      setRoleDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.message ?? 'Could not save role');
    }
  }

  async function savePermission() {
    try {
      if (editingPermission) await updatePermissionMutation.mutateAsync({ id: editingPermission.id, payload: { name } });
      else await createPermissionMutation.mutateAsync({ name });
      toast.success(editingPermission ? 'Permission updated' : 'Permission created');
      setPermissionDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.message ?? 'Could not save permission');
    }
  }

  async function removePermission(permission: PermissionRow) {
    try {
      await deletePermissionMutation.mutateAsync(permission.id);
      toast.success('Permission deleted');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.message ?? 'Could not delete permission');
    }
  }

  function togglePermission(permission: string, checked: boolean) {
    setCheckedPermissions((current) => checked ? Array.from(new Set([...current, permission])) : current.filter((item) => item !== permission));
  }

  async function saveRolePermissions() {
    if (!selectedRole) return;
    try {
      await assignMutation.mutateAsync({ id: selectedRole.id, permissions: checkedPermissions });
      toast.success('Role permissions updated');
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? error?.message ?? 'Could not update permissions');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground">Control Pearl Detergent DWMS module access using your backend RBAC permissions.</p>
        </div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => openPermissionDialog()}>Create permission</Button><Button onClick={() => openRoleDialog()}>Create role</Button></div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4" /> Roles</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{roles.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><KeyRound className="h-4 w-4" /> Permissions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{permissions.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Selected role</CardTitle></CardHeader><CardContent><div className="text-lg font-semibold">{selectedRole?.name ?? '—'}</div><p className="text-xs text-muted-foreground">{checkedPermissions.length} assigned permissions</p></CardContent></Card>
      </div>

      <Tabs defaultValue="matrix">
        <TabsList><TabsTrigger value="matrix">Permission matrix</TabsTrigger><TabsTrigger value="roles">Roles</TabsTrigger><TabsTrigger value="permissions">Permissions</TabsTrigger></TabsList>
        <TabsContent value="matrix" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <Card>
              <CardHeader><CardTitle>Roles</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2"><Input placeholder="Search roles" value={roleSearchInput} onChange={(event) => setRoleSearchInput(event.target.value)} /><Button variant="outline" size="icon" onClick={() => setRoleSearch(roleSearchInput)}><Search className="h-4 w-4" /></Button></div>
                <div className="space-y-1">
                  {rolesQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading roles...</p> : roles.map((role) => (
                    <button key={role.id} type="button" onClick={() => setSelectedRole(role)} className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${selectedRole?.id === role.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{role.name}</button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>{selectedRole?.name ?? 'Select role'} permissions</CardTitle><p className="text-sm text-muted-foreground">Assign backend permission names to the selected role.</p></div><Button onClick={saveRolePermissions} disabled={!selectedRole || assignMutation.isPending}><Save className="mr-2 h-4 w-4" />Save permissions</Button></CardHeader>
              <CardContent className="space-y-5">
                {Object.entries(groupedPermissions).map(([group, rows]) => (
                  <div key={group} className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">{readable(group)}</h3><Badge variant="secondary">{rows.filter((permission) => checkedPermissions.includes(permission.name)).length}/{rows.length}</Badge></div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {rows.map((permission) => (
                        <label key={permission.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm hover:bg-muted">
                          <Checkbox checked={checkedPermissions.includes(permission.name)} onCheckedChange={(checked) => togglePermission(permission.name, Boolean(checked))} />
                          <span>{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <Card><CardHeader><CardTitle>Roles list</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Guard</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{roles.map((role) => <TableRow key={role.id}><TableCell className="font-medium">{role.name}</TableCell><TableCell>{role.guard_name ?? 'sanctum'}</TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => openRoleDialog(role)}>Edit</Button></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <Card><CardHeader><CardTitle>Permissions list</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex gap-2"><Input placeholder="Search permissions" value={permissionSearchInput} onChange={(event) => setPermissionSearchInput(event.target.value)} /><Button variant="outline" onClick={() => setPermissionSearch(permissionSearchInput)}>Search</Button></div><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Group</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{permissions.map((permission) => <TableRow key={permission.id}><TableCell className="font-medium">{permission.name}</TableCell><TableCell>{readable(groupPermissionName(permission.name))}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => openPermissionDialog(permission)}>Edit</Button><Button variant="destructive" size="sm" onClick={() => removePermission(permission)}>Delete</Button></div></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editingRole ? 'Edit role' : 'Create role'}</DialogTitle></DialogHeader><div className="space-y-2"><Label>Role name</Label><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Example: Sales Officer" /></div><DialogFooter><Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button><Button onClick={saveRole}>{editingRole ? 'Save changes' : 'Create role'}</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editingPermission ? 'Edit permission' : 'Create permission'}</DialogTitle></DialogHeader><div className="space-y-2"><Label>Permission name</Label><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Example: products.read" /></div><DialogFooter><Button variant="outline" onClick={() => setPermissionDialogOpen(false)}>Cancel</Button><Button onClick={savePermission}>{editingPermission ? 'Save changes' : 'Create permission'}</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
