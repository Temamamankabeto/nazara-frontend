'use client';

import { useState, useMemo } from 'react';
import { History, Search, Filter, Calendar, User, Activity, Eye, RefreshCw, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuditLogsQuery } from '@/queries/audit-log.queries';
import type { AuditLogFilters, AuditLog } from '@/types/audit-log.types';

// Map frontend actions to backend action values
const actionToBackendMap: Record<string, string> = {
  'all': '',
  'login': 'login',
  'logout': 'logout',
  'created': 'created',
  'updated': 'updated',
  'deleted': 'deleted',
  'price_updated': 'price_updated',
  'stock_changed': 'stock_changed',
  'invoice_edited': 'invoice_edited',
  'payment_adjusted': 'payment_adjusted',
  'role_changed': 'role_changed',
  'status_changed': 'status_changed',
};

// Map frontend modules to backend module values
const moduleToBackendMap: Record<string, string> = {
  'all': '',
  'auth': 'auth',
  'users': 'users',
  'roles': 'roles',
  'inventory': 'inventory',
  'products': 'products',
  'suppliers': 'suppliers',
  'branches': 'branches',
  'warehouses': 'warehouses',
  'invoices': 'invoices',
  'payments': 'payments',
  'sales_orders': 'sales_orders',
  'purchases': 'purchases',
};

const modules = [
  { value: 'all', label: 'All Modules' },
  { value: 'auth', label: 'Authentication' },
  { value: 'users', label: 'Users' },
  { value: 'roles', label: 'Roles' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'products', label: 'Products' },
  { value: 'suppliers', label: 'Suppliers' },
  { value: 'branches', label: 'Branches' },
  { value: 'warehouses', label: 'Warehouses' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'payments', label: 'Payments' },
  { value: 'sales_orders', label: 'Sales Orders' },
  { value: 'purchases', label: 'Purchases' },
];

const actions = [
  { value: 'all', label: 'All Actions' },
  { value: 'login', label: 'Login', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'logout', label: 'Logout', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
  { value: 'created', label: 'Created', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'updated', label: 'Updated', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'deleted', label: 'Deleted', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'price_updated', label: 'Price Updated', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'stock_changed', label: 'Stock Changed', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { value: 'invoice_edited', label: 'Invoice Edited', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  { value: 'payment_adjusted', label: 'Payment Adjusted', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  { value: 'role_changed', label: 'Role Changed', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { value: 'status_changed', label: 'Status Changed', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
];

// Convert frontend filters to backend API parameters
function convertToBackendParams(filters: AuditLogFilters, page: number): Record<string, any> {
  const params: Record<string, any> = {};
  
  if (filters.per_page) params.per_page = filters.per_page;
  if (page) params.page = page;
  
  // Convert module to backend format
  if (filters.module && filters.module !== 'all') {
    params.module = moduleToBackendMap[filters.module];
  }
  
  // Convert action to backend format
  if (filters.action && filters.action !== 'all') {
    params.action = actionToBackendMap[filters.action];
  }
  
  // Add date filters if they exist
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  
  // Add search if exists
  if (filters.search) params.search = filters.search;
  
  return params;
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilters>({ 
    per_page: 20,
    search: '',
    module: 'all',
    action: 'all',
    date_from: '',
    date_to: '',
  });

  // Convert filters to backend format - pass page separately
  const backendParams = useMemo(() => convertToBackendParams(filters, page), [filters, page]);
  
  const logsQuery = useAuditLogsQuery(backendParams);
  const logs = logsQuery.data?.data ?? [];
  const meta = logsQuery.data?.meta ?? {
    current_page: page,
    per_page: 20,
    total: 0,
    last_page: 1,
  };

  const stats = useMemo(() => {
    const actionCounts = new Map<string, number>();
    logs.forEach(log => {
      const action = log.action || 'unknown';
      actionCounts.set(action, (actionCounts.get(action) || 0) + 1);
    });
    return {
      total: meta.total,
      actions: Array.from(actionCounts.entries()).map(([name, count]) => ({ name, count })),
    };
  }, [logs, meta.total]);

  function openDetails(log: AuditLog) {
    setSelectedLog(log);
    setDetailsOpen(true);
  }

  function resetFilters() {
    setFilters({
      per_page: 20,
      search: '',
      module: 'all',
      action: 'all',
      date_from: '',
      date_to: '',
    });
    setPage(1);
  }

  function applyFilters() {
    setPage(1);
  }

  function formatDate(dateString?: string) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(date);
  }

  function getActionBadgeStyle(action?: string) {
    const actionConfig = actions.find(a => a.value === action);
    return actionConfig?.color || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }

  function getActionLabel(action?: string) {
    const actionConfig = actions.find(a => a.value === action);
    return actionConfig?.label || action || '—';
  }

  function getModuleLabel(module?: string) {
    const moduleConfig = modules.find(m => m.value === module);
    return moduleConfig?.label || module || '—';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Audit Logs</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track user logins, stock changes, price updates, invoice edits, payment adjustments, and role changes.
          </p>
        </div>
        <Button variant="outline" onClick={() => logsQuery.refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold">Total Activities</span>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {stats.total.toLocaleString()}
              </Badge>
            </div>
            <div className="flex gap-2">
              {stats.actions.slice(0, 4).map(({ name, count }) => (
                <div key={name} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
                  <span className="text-sm font-medium capitalize">{name}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Filters Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Select 
              value={filters.module || 'all'} 
              onValueChange={(value) => setFilters({ ...filters, module: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module.value} value={module.value}>
                    {module.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.action || 'all'} 
              onValueChange={(value) => setFilters({ ...filters, action: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                {actions.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="date" 
                className="pl-9"
                placeholder="Date from"
                value={filters.date_from ?? ''} 
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="date" 
                className="pl-9"
                placeholder="Date to"
                value={filters.date_to ?? ''} 
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <Button onClick={applyFilters}>
              <Search className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="w-[70px] text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No audit logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetails(log)}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{log.user?.name ?? log.user_id ?? '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getModuleLabel(log.module)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionBadgeStyle(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm truncate">{log.description || '-'}</p>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {log.ip_address || '-'}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {(meta.current_page - 1) * meta.per_page + 1} to{' '}
              {Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total} entries
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || logsQuery.isLoading}
                onClick={() => setPage((value) => value - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.last_page || logsQuery.isLoading}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="sticky top-0 z-10 px-6 py-4 border-b bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Activity Details</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete information about this activity
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

          {selectedLog && (
            <div className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Basic Information</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-muted-foreground">Date & Time</span>
                        <span className="text-sm font-medium">{formatDate(selectedLog.created_at)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-muted-foreground">User</span>
                        <span className="text-sm font-medium">{selectedLog.user?.name ?? selectedLog.user_id ?? '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-muted-foreground">IP Address</span>
                        <code className="text-xs bg-muted px-2 py-0.5 rounded">{selectedLog.ip_address || '-'}</code>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-muted-foreground">User Agent</span>
                        <span className="text-xs font-mono truncate max-w-[200px]">{selectedLog.user_agent || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/30">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Activity Information</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-muted-foreground">Module</span>
                        <Badge variant="outline">{getModuleLabel(selectedLog.module)}</Badge>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-muted-foreground">Action</span>
                        <Badge className={getActionBadgeStyle(selectedLog.action)}>
                          {getActionLabel(selectedLog.action)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-muted-foreground">Auditable Type</span>
                        <span className="text-sm font-mono">{selectedLog.auditable_type || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-muted-foreground">Auditable ID</span>
                        <span className="text-sm font-mono">{selectedLog.auditable_id || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
                    <p className="mt-2 text-sm">{selectedLog.description || '-'}</p>
                  </div>

                  {(selectedLog.old_values || selectedLog.new_values) && (
                    <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                      <Label className="text-xs text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">Changes</Label>
                      <div className="mt-2 space-y-2">
                        {selectedLog.old_values && (
                          <div>
                            <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">Old Values:</p>
                            <pre className="mt-1 text-xs bg-background p-2 rounded overflow-auto max-h-40">
                              {JSON.stringify(selectedLog.old_values, null, 2)}
                            </pre>
                          </div>
                        )}
                        {selectedLog.new_values && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-green-700 dark:text-green-400">New Values:</p>
                            <pre className="mt-1 text-xs bg-background p-2 rounded overflow-auto max-h-40">
                              {JSON.stringify(selectedLog.new_values, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="sticky bottom-0 px-6 py-4 border-t bg-background flex justify-end">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}