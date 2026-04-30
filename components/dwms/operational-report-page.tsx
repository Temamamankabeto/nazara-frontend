'use client';

import { useMemo, useState } from 'react';
import { ClipboardList, Download, FileText, PackageCheck, RefreshCcw, Truck, Wallet } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOperationalAdvancedReport } from '@/queries/report.queries';
import type { ReportFilters, ReportPeriod } from '@/types/report.types';

const periodOptions: Array<{ label: string; value: ReportPeriod }> = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
];

function money(value: unknown) {
  return `ETB ${Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function numberValue(value: unknown) {
  return Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-ET', { year: 'numeric', month: 'short', day: '2-digit' }).format(date);
}

function titleize(value?: string | null) {
  return String(value ?? '—').replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function downloadCsv(filename: string, rows: Record<string, any>[]) {
  if (rows.length === 0) return;
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const csv = [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => `"${String(row[column] ?? '').replaceAll('"', '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function StatCard({ title, value, icon: Icon, note }: { title: string; value: string | number; icon: any; note?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {note ? <p className="mt-1 text-xs text-muted-foreground">{note}</p> : null}
      </CardContent>
    </Card>
  );
}

function StatusList({ title, rows, labelKey, countKey, amountKey }: { title: string; rows: any[]; labelKey: string; countKey: string; amountKey?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="break-words text-sm text-muted-foreground">No data found.</p>
        ) : (
          rows.map((row, index) => (
            <div key={`${row[labelKey]}-${index}`} className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="font-medium">{titleize(row[labelKey])}</p>
                <p className="text-xs text-muted-foreground">Count: {numberValue(row[countKey])}</p>
              </div>
              {amountKey ? <Badge variant="secondary">{money(row[amountKey])}</Badge> : <Badge variant="secondary">{numberValue(row[countKey])}</Badge>}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function OperationalAdvancedReportPage() {
  const [filters, setFilters] = useState<ReportFilters>({ period: 'today' });
  const query = useOperationalAdvancedReport(filters);
  const payload = query.data?.data ?? {};
  const summary = payload.summary ?? {};
  const requestsByStatus = payload.requests_by_status ?? [];
  const ordersByStatus = payload.orders_by_status ?? [];
  const topReceivedProducts = payload.top_received_products ?? [];
  const purchaseItems = payload.purchase_items ?? [];
  const purchaseRequests = payload.purchase_requests ?? [];
  const purchaseOrders = payload.purchase_orders ?? [];
  const supplierInvoices = payload.supplier_invoices ?? [];
  const recentReceiving = payload.recent_receiving ?? [];

  function setPeriod(period: ReportPeriod) {
    if (period === 'custom') {
      setFilters({ ...filters, period });
      return;
    }
    setFilters({ ...filters, period, date_from: undefined, date_to: undefined });
  }

  const exportRows = useMemo(
    () => [
      ...purchaseRequests.map((row: any) => ({ type: 'Purchase Request', number: row.request_number, date: row.request_date, status: row.status, requester: row.requested_by?.name ?? row.requestedBy?.name })),
      ...purchaseOrders.map((row: any) => ({ type: 'Purchase Order', number: row.po_number, date: row.order_date, status: row.status, supplier: row.supplier?.name, total: row.total })),
      ...supplierInvoices.map((row: any) => ({ type: 'Supplier Invoice', number: row.invoice_number, date: row.invoice_date, status: row.status, supplier: row.supplier?.name, total: row.total, balance: row.balance })),
      ...recentReceiving.map((row: any) => ({ type: 'Receiving', product: row.product_name, po_number: row.po_number, warehouse: row.warehouse_name, quantity: row.quantity, unit_cost: row.unit_cost, date: row.created_at })),
    ],
    [purchaseRequests, purchaseOrders, supplierInvoices, recentReceiving],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <ClipboardList className="h-6 w-6" />
            Operational Reports
          </h1>
          <p className="break-words text-sm text-muted-foreground">
            Purchase requests, purchase orders, receiving, and supplier invoice totals.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button variant="outline" onClick={() => query.refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => downloadCsv('operational-report.csv', exportRows)}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {periodOptions.map((option) => (
              <Button key={option.value} variant={filters.period === option.value ? 'default' : 'outline'} size="sm" className="w-full sm:w-auto" onClick={() => setPeriod(option.value)}>
                {option.label}
              </Button>
            ))}
          </div>

          {filters.period === 'custom' ? (
            <div className="grid gap-3 md:grid-cols-3">
              <Input type="date" value={filters.date_from ?? ''} onChange={(event) => setFilters({ ...filters, date_from: event.target.value })} />
              <Input type="date" value={filters.date_to ?? ''} onChange={(event) => setFilters({ ...filters, date_to: event.target.value })} />
              <Button variant="secondary" onClick={() => query.refetch()}>
                Apply custom range
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Purchase Requests" value={numberValue(summary.purchase_requests_count)} icon={ClipboardList} note={`${formatDate(summary.date_from)} - ${formatDate(summary.date_to)}`} />
        <StatCard title="Purchase Orders" value={numberValue(summary.purchase_orders_count)} icon={PackageCheck} note={money(summary.purchase_orders_total)} />
        <StatCard title="Received Stock" value={numberValue(summary.received_quantity)} icon={Truck} note={money(summary.received_value)} />
        <StatCard title="Supplier Invoice Balance" value={money(summary.supplier_balance_total)} icon={Wallet} note={`${numberValue(summary.supplier_invoices_count)} invoices`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <StatusList title="Purchase requests by status" rows={requestsByStatus} labelKey="status" countKey="requests_count" />
        <StatusList title="Purchase orders by status" rows={ordersByStatus} labelKey="status" countKey="orders_count" amountKey="total_amount" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top received products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Received Qty</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading ? (
                  <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
                ) : topReceivedProducts.length === 0 ? (
                  <TableRow><TableCell colSpan={4}>No received products found.</TableCell></TableRow>
                ) : (
                  topReceivedProducts.map((item: any) => (
                    <TableRow key={item.product_id ?? item.rank}>
                      <TableCell>#{item.rank}</TableCell>
                      <TableCell><div className="font-medium">{item.product_name}</div><div className="text-xs text-muted-foreground">{item.sku ?? '—'}</div></TableCell>
                      <TableCell>{numberValue(item.received_quantity)}</TableCell>
                      <TableCell>{money(item.received_value)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase items summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Ordered</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseItems.length === 0 ? (
                  <TableRow><TableCell colSpan={4}>No purchase items found.</TableCell></TableRow>
                ) : (
                  purchaseItems.slice(0, 10).map((item: any) => (
                    <TableRow key={item.product_id}>
                      <TableCell><div className="font-medium">{item.product_name}</div><div className="text-xs text-muted-foreground">{item.sku ?? '—'}</div></TableCell>
                      <TableCell>{numberValue(item.ordered_quantity)}</TableCell>
                      <TableCell>{numberValue(item.received_quantity)}</TableCell>
                      <TableCell>{money(item.ordered_value)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent purchase orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.length === 0 ? (
                <TableRow><TableCell colSpan={6}>No purchase orders found.</TableCell></TableRow>
              ) : (
                purchaseOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.po_number}</TableCell>
                    <TableCell>{order.supplier?.name ?? '—'}</TableCell>
                    <TableCell>{order.warehouse?.name ?? '—'}</TableCell>
                    <TableCell>{formatDate(order.order_date)}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{titleize(order.status)}</Badge></TableCell>
                    <TableCell>{money(order.total)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Supplier invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierInvoices.length === 0 ? (
                  <TableRow><TableCell colSpan={5}>No supplier invoices found.</TableCell></TableRow>
                ) : (
                  supplierInvoices.map((invoice: any) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.supplier?.name ?? '—'}</TableCell>
                      <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                      <TableCell>{money(invoice.total)}</TableCell>
                      <TableCell>{money(invoice.balance)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent receiving</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>PO</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReceiving.length === 0 ? (
                  <TableRow><TableCell colSpan={5}>No receiving records found.</TableCell></TableRow>
                ) : (
                  recentReceiving.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell><div className="font-medium">{row.product_name}</div><div className="text-xs text-muted-foreground">{row.sku ?? '—'}</div></TableCell>
                      <TableCell>{row.po_number ?? `PO #${row.reference_id}`}</TableCell>
                      <TableCell>{row.warehouse_name ?? '—'}</TableCell>
                      <TableCell>{numberValue(row.quantity)}</TableCell>
                      <TableCell>{formatDate(row.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
