'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Bell, CheckCheck, FileWarning, PackageSearch, ShoppingCart, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNotificationsQuery, useUnreadNotificationsQuery } from '@/queries/notification.queries';
import { useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation } from '@/hooks/use-notifications';

function categoryOf(item: any) {
  const data = item.data ?? {};
  const text = `${data.category ?? ''} ${data.module ?? ''} ${data.title ?? ''} ${data.message ?? ''}`.toLowerCase();
  if (text.includes('low') || text.includes('stock')) return 'low_stock';
  if (text.includes('overdue') || text.includes('invoice')) return 'overdue_invoice';
  if (text.includes('sale') || text.includes('order')) return 'sales';
  if (text.includes('purchase')) return 'purchase';
  return data.category ?? 'system';
}

function iconFor(category: string) {
  if (category === 'low_stock') return PackageSearch;
  if (category === 'overdue_invoice') return FileWarning;
  if (category === 'sales') return ShoppingCart;
  if (category === 'purchase') return Truck;
  return Bell;
}

export default function NotificationsPage() {
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const filters = { page, per_page: 15, ...(type !== 'all' ? { type } : {}) };
  const notificationsQuery = useNotificationsQuery(filters);
  const unreadQuery = useUnreadNotificationsQuery();
  const markRead = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();

  const rows = notificationsQuery.data?.data ?? [];
  const meta = notificationsQuery.data?.meta ?? { current_page: page, last_page: 1, per_page: 15, total: rows.length };
  const unreadCount = unreadQuery.data?.data?.unread_count ?? rows.filter((row) => !row.read_at).length;

  const summary = useMemo(() => {
    const counts = { low_stock: 0, overdue_invoice: 0, sales: 0, purchase: 0 } as Record<string, number>;
    rows.forEach((row) => { const key = categoryOf(row); if (key in counts) counts[key] += 1; });
    return counts;
  }, [rows]);

  async function handleMarkRead(id: string) {
    try { await markRead.mutateAsync(id); toast.success('Notification marked as read'); }
    catch (error: any) { toast.error(error?.response?.data?.message ?? 'Could not mark notification as read'); }
  }

  async function handleMarkAllRead() {
    try { await markAll.mutateAsync(); toast.success('All notifications marked as read'); }
    catch (error: any) { toast.error(error?.response?.data?.message ?? 'Could not mark notifications as read'); }
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div><h1 className="flex items-center gap-2 text-2xl font-semibold"><Bell className="h-6 w-6" />Notifications</h1><p className="text-sm text-muted-foreground">Low stock alerts, overdue invoice alerts, and new sales/purchase activity.</p></div>
      <Button onClick={handleMarkAllRead} disabled={markAll.isPending || unreadCount === 0}><CheckCheck className="mr-2 h-4 w-4" />Mark all read</Button>
    </div>

    <div className="grid gap-4 md:grid-cols-5">
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Unread</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{unreadCount}</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Low stock</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{summary.low_stock}</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Overdue invoice</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{summary.overdue_invoice}</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Sales</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{summary.sales}</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Purchases</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{summary.purchase}</div></CardContent></Card>
    </div>

    <Card>
      <CardHeader><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><CardTitle>Notification center</CardTitle><Select value={type} onValueChange={setType}><SelectTrigger className="md:w-[220px]"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="all">All notifications</SelectItem><SelectItem value="low_stock">Low stock</SelectItem><SelectItem value="overdue_invoice">Overdue invoices</SelectItem><SelectItem value="sales">Sales alerts</SelectItem><SelectItem value="purchase">Purchase alerts</SelectItem></SelectContent></Select></div></CardHeader>
      <CardContent>
        {notificationsQuery.isError && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Notifications UI is ready. Confirm backend routes /notifications, /notifications/unread-count, /notifications/&#123;id&#125;/read, and /notifications/read-all are enabled.</div>}
        <Table><TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Message</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>
          {notificationsQuery.isLoading ? <TableRow><TableCell colSpan={5}>Loading notifications...</TableCell></TableRow> : rows.length === 0 ? <TableRow><TableCell colSpan={5}>No notifications found.</TableCell></TableRow> : rows.map((row) => { const category = categoryOf(row); const Icon = iconFor(category); const data = row.data ?? {}; return <TableRow key={row.id}><TableCell><div className="flex items-center gap-2"><Icon className="h-4 w-4" /><span className="capitalize">{category.replace(/_/g, ' ')}</span></div></TableCell><TableCell><div className="font-medium">{data.title ?? data.module ?? 'System notification'}</div><div className="text-sm text-muted-foreground">{data.message ?? JSON.stringify(data)}</div></TableCell><TableCell><Badge variant={row.read_at ? 'secondary' : 'default'}>{row.read_at ? 'Read' : 'Unread'}</Badge></TableCell><TableCell>{row.created_at ?? '-'}</TableCell><TableCell className="text-right">{!row.read_at && <Button variant="outline" size="sm" onClick={() => handleMarkRead(row.id)}>Mark read</Button>}</TableCell></TableRow>; })}
        </TableBody></Table>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground"><span>Page {meta.current_page} of {meta.last_page}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={meta.current_page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={meta.current_page >= meta.last_page} onClick={() => setPage(page + 1)}>Next</Button></div></div>
      </CardContent>
    </Card>
  </div>;
}
