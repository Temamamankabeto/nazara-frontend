'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, MoreHorizontal, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import { RootState } from '@/stores';
import { getRoleDataScope } from '@/lib/role-access';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type ResourceField = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  options?: { label: string; value: string | number | boolean }[];
  defaultValue?: string | number | boolean;
};

export type ResourceColumn = {
  key: string;
  label: string;
  badge?: boolean;
  money?: boolean;
};

export type SimpleResourceConfig = {
  title: string;
  description?: string;
  endpoint: string;
  columns: ResourceColumn[];
  fields: ResourceField[];
  searchable?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  detailBasePath?: string;
  detailLabel?: string;
  params?: Record<string, any>;
};

type Row = Record<string, any>;

function read(obj: Row, path: string) {
  return path.split('.').reduce((value, key) => value?.[key], obj);
}

function emptyForm(fields: ResourceField[]) {
  return fields.reduce<Row>((acc, field) => {
    if (field.defaultValue !== undefined) acc[field.name] = field.defaultValue;
    else if (field.type === 'checkbox') acc[field.name] = false;
    else if (field.type === 'select' && field.options?.length) acc[field.name] = field.options[0].value;
    else acc[field.name] = '';
    return acc;
  }, {});
}

function normalizeList(payload: any) {
  const data = payload?.data?.data ?? payload?.data ?? payload;
  const meta = payload?.data?.meta ?? payload?.meta ?? null;
  return { rows: Array.isArray(data) ? data : [], meta };
}

function formatCell(value: any, column: ResourceColumn) {
  if (value === null || value === undefined || value === '') return '-';
  if (column.money) return `${Number(value || 0).toLocaleString()} ETB`;
  if (typeof value === 'boolean') return value ? 'Active' : 'Inactive';
  return String(value);
}

export default function SimpleResourcePage({ config }: { config: SimpleResourceConfig }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>(() => emptyForm(config.fields));

  const canCreate = config.canCreate !== false;
  const canEdit = config.canEdit !== false;
  const canDelete = config.canDelete !== false;

  const params = useMemo(() => ({
    page,
    per_page: 10,
    search: search || undefined,
    ...(config.params ?? {}),
    ...getRoleDataScope(user),
  }), [page, search, config.params, user]);

  async function load() {
    setLoading(true);
    try {
      const response = await api.get(config.endpoint, { params });
      const normalized = normalizeList(response.data);
      setRows(normalized.rows);
      setMeta(normalized.meta);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? `Failed to load ${config.title}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [config.endpoint, params]);

  function openCreate() {
    setSelected(null);
    setForm(emptyForm(config.fields));
    setOpen(true);
  }

  function openEdit(row: Row) {
    setSelected(row);
    const next = emptyForm(config.fields);
    config.fields.forEach((field) => {
      next[field.name] = row[field.name] ?? '';
    });
    setForm(next);
    setOpen(true);
  }

  async function save() {
    try {
      if (selected?.id) {
        await api.put(`${config.endpoint}/${selected.id}`, form);
        toast.success(`${config.title} updated`);
      } else {
        await api.post(config.endpoint, form);
        toast.success(`${config.title} created`);
      }
      setOpen(false);
      load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Save failed');
    }
  }

  async function remove(row: Row) {
    if (!confirm(`Delete ${row.name ?? row.id}?`)) return;
    try {
      await api.delete(`${config.endpoint}/${row.id}`);
      toast.success(`${config.title} deleted`);
      load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Delete failed');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{config.title}</h1>
          {config.description ? <p className="text-sm text-muted-foreground">{config.description}</p> : null}
        </div>
        {canCreate ? <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add</Button> : null}
      </div>

      <Card>
        <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base">List</CardTitle>
          {config.searchable !== false ? (
            <div className="flex w-full gap-2 md:w-80">
              <Input placeholder="Search..." value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
              <Button variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {config.columns.map((column) => <TableHead key={column.key}>{column.label}</TableHead>)}
                  <TableHead className="w-16 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={config.columns.length + 1}>Loading...</TableCell></TableRow>
                ) : rows.length === 0 ? (
                  <TableRow><TableCell colSpan={config.columns.length + 1}>No data found.</TableCell></TableRow>
                ) : rows.map((row) => (
                  <TableRow key={row.id}>
                    {config.columns.map((column) => {
                      const value = read(row, column.key);
                      const content = formatCell(value, column);
                      return <TableCell key={column.key}>{column.badge ? <Badge variant="outline">{content}</Badge> : content}</TableCell>;
                    })}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {config.detailBasePath && row.id ? (
                            <DropdownMenuItem asChild>
                              <Link href={`${config.detailBasePath}/${row.id}`}>
                                <Eye className="mr-2 h-4 w-4" /> {config.detailLabel ?? 'Open Details'}
                              </Link>
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onClick={() => { setSelected(row); setViewOpen(true); }}><Eye className="mr-2 h-4 w-4" /> Quick View</DropdownMenuItem>
                          {canEdit ? <DropdownMenuItem onClick={() => openEdit(row)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem> : null}
                          {canDelete ? <DropdownMenuItem className="text-destructive" onClick={() => remove(row)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem> : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Total: {meta?.total ?? rows.length}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={meta && page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selected ? 'Edit' : 'Create'} {config.title}</DialogTitle></DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label>{field.label}</Label>
                {field.type === 'select' ? (
                  <Select
                    value={String(form[field.name] ?? '')}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, [field.name]: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options ?? []).map((option) => (
                        <SelectItem key={String(option.value)} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'textarea' ? (
                  <Textarea
                    value={form[field.name] ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    required={field.required}
                  />
                ) : field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.name])}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.checked }))}
                    className="h-4 w-4"
                  />
                ) : (
                  <Input
                    type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                    value={form[field.name] ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{config.title} Details</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            {config.columns.map((column) => (
              <div key={column.key} className="flex justify-between gap-4 border-b py-2">
                <span className="text-muted-foreground">{column.label}</span>
                <span className="font-medium">{formatCell(read(selected ?? {}, column.key), column)}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
