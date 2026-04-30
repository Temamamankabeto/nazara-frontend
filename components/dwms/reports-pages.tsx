'use client';

import { useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Download,
  FileText,
  PackageSearch,
  RefreshCcw,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
  Warehouse,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useAdjustmentReport,
  useCustomerBalancesReport,
  useInactiveCustomersReport,
  useInventoryAdvancedReport,
  usePaymentSummaryReport,
  useProfitEstimationReport,
  usePurchaseSummaryReport,
  useReportLowStock,
  useReportMovementHistory,
  useReportStockBalance,
  useReportStockValuation,
  useReturnsSummaryReport,
  useSalesByDistributorReport,
  useSalesByRegionReport,
  useSalesDailyReport,
  useSalesMonthlyReport,
  useSupplierBalancesReport,
  useTopProductsReport,
  useWarehouseSummaryReport,
} from '@/queries/report.queries';
import type { ReportFilters, ReportPeriod } from '@/types/report.types';

type QueryResult = { data?: any; isLoading?: boolean; isError?: boolean; refetch?: () => void };

type ReportShellProps = {
  title: string;
  description: string;
  icon?: any;
  query: QueryResult;
  filters: ReportFilters;
  setFilters: (filters: ReportFilters) => void;
  fallback?: string;
};

const periodOptions: Array<{ label: string; value: ReportPeriod }> = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
];

function money(value: unknown) {
  return `ETB ${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function numberValue(value: unknown) {
  return Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-ET', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

function asRows(payload: any) {
  const data = payload?.data?.data ?? payload?.data ?? [];
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return Object.entries(data).map(([key, value]) => ({ name: key, value }));
  return [];
}

function asSummary(payload: any) {
  return payload?.summary ?? payload?.data?.summary ?? payload?.meta?.summary ?? {};
}

function titleize(key: string) {
  return key.replaceAll('_', ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}

function display(value: any) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'object') return value.name ?? value.title ?? value.order_number ?? value.invoice_number ?? JSON.stringify(value);
  return String(value);
}

function downloadCsv(filename: string, rows: Record<string, any>[]) {
  if (rows.length === 0) return;

  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const csv = [
    columns.join(','),
    ...rows.map((row) =>
      columns
        .map((column) => `"${String(display(row[column])).replaceAll('"', '""')}"`)
        .join(','),
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function ReportShell({ title, description, icon: Icon = BarChart3, query, filters, setFilters, fallback }: ReportShellProps) {
  const rows = useMemo(() => asRows(query.data), [query.data]);
  const summary = asSummary(query.data);
  const columns = useMemo(
    () => Array.from(new Set(rows.flatMap((row: any) => Object.keys(row)).filter((key) => !['items', 'relations'].includes(key)))).slice(0, 8),
    [rows],
  );
  const summaryEntries = Object.entries(summary).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Icon className="h-6 w-6" />
            {title}
          </h1>
          <p className="break-words text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button variant="outline" onClick={() => query.refetch?.()}>
            Refresh
          </Button>
          <Button variant="outline" onClick={() => downloadCsv(`${title.toLowerCase().replaceAll(' ', '-')}.csv`, rows)}>
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
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input type="date" value={filters.date_from ?? ''} onChange={(event) => setFilters({ ...filters, date_from: event.target.value })} />
          <Input type="date" value={filters.date_to ?? ''} onChange={(event) => setFilters({ ...filters, date_to: event.target.value })} />
          <Input
            placeholder="Branch ID / Warehouse ID / Region"
            value={String(filters.branch_id ?? filters.warehouse_id ?? filters.region ?? '')}
            onChange={(event) => setFilters({ ...filters, branch_id: event.target.value, warehouse_id: event.target.value, region: event.target.value })}
          />
          <Button variant="secondary" onClick={() => setFilters({})}>
            Clear filters
          </Button>
        </CardContent>
      </Card>

      {summaryEntries.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {summaryEntries.map(([key, value]) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{titleize(key)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(typeof value === 'number' && key.includes('amount')) || key.includes('total') || key.includes('balance') || key.includes('value')
                    ? money(value)
                    : display(value)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {query.isError ? (
        <Card className="border-amber-200">
          <CardContent className="pt-6 text-sm text-amber-700">
            {fallback ?? 'This report route is prepared in the frontend. If your backend route is not yet available, add the matching report endpoint or adjust the service URL.'}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Report data</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>{columns.length === 0 ? <TableHead>Result</TableHead> : columns.map((column) => <TableHead key={column}>{titleize(column)}</TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                <TableRow>
                  <TableCell colSpan={Math.max(columns.length, 1)}>Loading report...</TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={Math.max(columns.length, 1)}>No records found.</TableCell>
                </TableRow>
              ) : (
                rows.map((row: any, index: number) => (
                  <TableRow key={row.id ?? index}>{columns.map((column) => <TableCell key={column}>{display(row[column])}</TableCell>)}</TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function useFilters(defaultFilters: ReportFilters = {}) {
  return useState<ReportFilters>(defaultFilters);
}

function SalesReportPage({ defaultPeriod = 'today' as ReportPeriod }: { defaultPeriod?: ReportPeriod }) {
  const [filters, setFilters] = useFilters({ period: defaultPeriod });
  const query = useSalesDailyReport(filters);
  const payload = query.data?.data ?? {};
  const summary = payload.summary ?? {};
  const orders = payload.orders ?? [];
  const soldItems = payload.sold_items ?? [];
  const topSellingProducts = soldItems.slice(0, 5);
  const salesByStatus = payload.sales_by_status ?? [];
  const salesByRegion = payload.sales_by_region ?? [];
  const salesByCustomer = payload.sales_by_customer ?? [];

  function setPeriod(period: ReportPeriod) {
    if (period === 'custom') {
      setFilters({ ...filters, period });
      return;
    }
    setFilters({ ...filters, period, date_from: undefined, date_to: undefined });
  }

  const exportRows = [
    ...orders.map((order: any) => ({ type: 'Order', number: order.order_number, customer: order.customer?.name, date: order.order_date, status: order.status, total: order.total })),
    ...soldItems.map((item: any, index: number) => ({ type: 'Sold Item', product_rank: item.rank, product: item.product_name, sku: item.sku, quantity: item.quantity_sold, average_unit_price: item.average_unit_price, total: item.total_sales })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <TrendingUp className="h-6 w-6" />
            Sales Report
          </h1>
          <p className="break-words text-sm text-muted-foreground">
            Filter sales by today, this week, this month, this year, or a custom date range with order and sold-item details.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button variant="outline" onClick={() => query.refetch?.()}>
            Refresh
          </Button>
          <Button variant="outline" onClick={() => downloadCsv('sales-report.csv', exportRows)}>
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
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Date filter
          </CardTitle>
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
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Input type="date" value={filters.date_from ?? ''} onChange={(event) => setFilters({ ...filters, date_from: event.target.value })} />
              <Input type="date" value={filters.date_to ?? ''} onChange={(event) => setFilters({ ...filters, date_to: event.target.value })} />
              <Button onClick={() => query.refetch?.()}>Apply</Button>
            </div>
          ) : null}

          <div className="break-words text-sm text-muted-foreground">
            Showing: {formatDate(summary.date_from)} - {formatDate(summary.date_to)}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total sales</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{money(summary.total_sales)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Orders</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{numberValue(summary.orders_count)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Items sold</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{numberValue(summary.items_count)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Average order</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{money(summary.average_order_value)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Discount</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{money(summary.discount)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tax</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{money(summary.tax)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Paid amount</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{money(summary.paid_total)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Balance</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{money(summary.balance_total)}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Sales by status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {salesByStatus.length === 0 ? <p className="break-words text-sm text-muted-foreground">No status data.</p> : salesByStatus.map((row: any) => (
              <div key={row.status} className="flex items-center justify-between rounded-lg border p-3">
                <Badge variant="outline" className="capitalize">{row.status}</Badge>
                <div className="text-right text-sm"><div>{money(row.total_sales)}</div><div className="text-xs text-muted-foreground">{row.orders_count} orders</div></div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sales by region</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {salesByRegion.length === 0 ? <p className="break-words text-sm text-muted-foreground">No region data.</p> : salesByRegion.slice(0, 6).map((row: any) => (
              <div key={row.region} className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium">{row.region}</span>
                <div className="text-right text-sm"><div>{money(row.total_sales)}</div><div className="text-xs text-muted-foreground">{row.orders_count} orders</div></div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top customers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {salesByCustomer.length === 0 ? <p className="break-words text-sm text-muted-foreground">No customer data.</p> : salesByCustomer.slice(0, 6).map((row: any) => (
              <div key={row.customer_id} className="flex items-center justify-between rounded-lg border p-3">
                <div><div className="font-medium">{row.customer_name}</div><div className="text-xs text-muted-foreground">{row.customer_type ?? 'Customer'} • {row.region ?? 'No region'}</div></div>
                <div className="text-right text-sm"><div>{money(row.total_sales)}</div><div className="text-xs text-muted-foreground">{row.orders_count} orders</div></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PackageSearch className="h-5 w-5" />Top selling products ranking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topSellingProducts.length === 0 ? <p className="break-words text-sm text-muted-foreground">No top-selling products found.</p> : topSellingProducts.map((item: any, index: number) => (
            <div key={item.product_id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Badge variant={index === 0 ? 'default' : 'secondary'}>#{item.rank ?? index + 1}</Badge>
                <div>
                  <div className="font-medium">{item.product_name}</div>
                  <div className="text-xs text-muted-foreground">{item.category_name ?? 'No category'} • {numberValue(item.quantity_sold)} sold</div>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium">{money(item.total_sales)}</div>
                <div className="text-xs text-muted-foreground">Avg {money(item.average_unit_price)}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PackageSearch className="h-5 w-5" />Sold items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Qty Sold</TableHead>
                <TableHead>Avg Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                <TableRow><TableCell colSpan={8}>Loading sold items...</TableCell></TableRow>
              ) : soldItems.length === 0 ? (
                <TableRow><TableCell colSpan={8}>No sold items found.</TableCell></TableRow>
              ) : soldItems.map((item: any, index: number) => (
                <TableRow key={item.product_id}>
                  <TableCell><Badge variant="secondary">#{item.rank ?? index + 1}</Badge></TableCell>
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell>{item.category_name ?? '—'}</TableCell>
                  <TableCell>{item.sku ?? '—'}</TableCell>
                  <TableCell>{numberValue(item.orders_count)}</TableCell>
                  <TableCell>{numberValue(item.quantity_sold)}</TableCell>
                  <TableCell>{money(item.average_unit_price)}</TableCell>
                  <TableCell>{money(item.total_sales)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Sales orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                <TableRow><TableCell colSpan={9}>Loading sales orders...</TableCell></TableRow>
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={9}>No sales orders found.</TableCell></TableRow>
              ) : orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number ?? `SO-${order.id}`}</TableCell>
                  <TableCell>{order.customer?.name ?? order.customer_id}</TableCell>
                  <TableCell>{order.warehouse?.name ?? order.warehouse_id}</TableCell>
                  <TableCell>{formatDate(order.order_date)}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{order.status}</Badge></TableCell>
                  <TableCell>{money(order.subtotal)}</TableCell>
                  <TableCell>{money(order.discount)}</TableCell>
                  <TableCell>{money(order.tax)}</TableCell>
                  <TableCell>{money(order.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function ReportsOverviewPage() {
  const reportGroups = [
    { title: 'Sales Reports', icon: TrendingUp, hrefs: ['Sales report', 'Top-selling products', 'Sales by region', 'Sales by distributor'] },
    { title: 'Inventory Reports', icon: Warehouse, hrefs: ['Stock balance', 'Low-stock alerts', 'Stock valuation', 'Movement history', 'Warehouse stock summary'] },
    { title: 'Financial Reports', icon: Wallet, hrefs: ['Customer outstanding balances', 'Supplier balances', 'Payment summary', 'Profit estimation'] },
    { title: 'Operational Reports', icon: ClipboardList, hrefs: ['Purchase summary', 'Returns summary', 'Adjustment report', 'Inactive customers'] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reporting & Analytics</h1>
        <p className="break-words text-sm text-muted-foreground">Role-aware report center for sales, inventory, finance, and operations.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {reportGroups.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icon className="h-5 w-5" />{group.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.hrefs.map((item) => <div key={item} className="rounded-lg border p-3 text-sm">{item}</div>)}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function DailySalesReportPage() { return <SalesReportPage defaultPeriod="today" />; }
export function MonthlySalesReportPage() { return <SalesReportPage defaultPeriod="month" />; }
export function TopSellingProductsReportPage() { return <SalesReportPage defaultPeriod="month" />; }
export function SalesByRegionReportPage() { return <SalesReportPage defaultPeriod="month" />; }
export function SalesByDistributorReportPage() { return <SalesReportPage defaultPeriod="month" />; }
export function InventoryAdvancedReportPageRoute() { return <InventoryAdvancedReportPage defaultPeriod="today" />; }
export function StockBalanceReportPage() { const [filters, setFilters] = useFilters(); return <ReportShell title="Stock Balance Report" description="Current product stock by warehouse/location." icon={Warehouse} filters={filters} setFilters={setFilters} query={useReportStockBalance(filters)} />; }
export function LowStockReportPage() { const [filters, setFilters] = useFilters(); return <ReportShell title="Low Stock Alerts Report" description="Products at or below reorder level." icon={PackageSearch} filters={filters} setFilters={setFilters} query={useReportLowStock(filters)} />; }
export function StockValuationReportPage() { const [filters, setFilters] = useFilters(); return <ReportShell title="Stock Valuation Report" description="Inventory value by product and warehouse." icon={BarChart3} filters={filters} setFilters={setFilters} query={useReportStockValuation(filters)} />; }
export function MovementHistoryReportPage() { const [filters, setFilters] = useFilters(); return <ReportShell title="Movement History Report" description="Purchase, sale, transfer, return, adjustment, and damage stock movements." icon={RefreshCcw} filters={filters} setFilters={setFilters} query={useReportMovementHistory(filters)} />; }
export function WarehouseSummaryReportPage() { const [filters, setFilters] = useFilters(); return <ReportShell title="Warehouse Stock Summary" description="Warehouse-level inventory totals and stock health." icon={Warehouse} filters={filters} setFilters={setFilters} query={useWarehouseSummaryReport(filters)} />; }
export function CustomerOutstandingBalancesReportPage() { const [filters, setFilters] = useFilters(); return <ReportShell title="Customer Outstanding Balances" description="Receivables and unpaid customer invoice balances." icon={Wallet} filters={filters} setFilters={setFilters} query={useCustomerBalancesReport(filters)} />; }
export function SupplierBalancesReportPage() { const [filters, setFilters] = useFilters(); return <ReportShell title="Supplier Balances" description="Supplier payables and supplier invoice balances." icon={Wallet} filters={filters} setFilters={setFilters} query={useSupplierBalancesReport(filters)} />; }
export function PaymentSummaryReportPage() { const [filters, setFilters] = useFilters(); return <ReportShell title="Payment Summary" description="Cash, bank transfer, mobile payment, and credit settlement summary." icon={Wallet} filters={filters} setFilters={setFilters} query={usePaymentSummaryReport(filters)} />; }
export function ProfitEstimationReportPage() { const [filters, setFilters] = useFilters(); return <ReportShell title="Profit Estimation" description="Estimated gross profit from sales revenue and product cost." icon={BarChart3} filters={filters} setFilters={setFilters} query={useProfitEstimationReport(filters)} />; }
export function PurchaseSummaryReportPage() { const [filters, setFilters] = useFilters(); return <ReportShell title="Purchase Summary" description="Purchase requests, purchase orders, receiving, and supplier invoice totals." icon={FileText} filters={filters} setFilters={setFilters} query={usePurchaseSummaryReport(filters)} />; }
export function ReturnsSummaryReportPage() { const [filters, setFilters] = useFilters(); return <ReportShell title="Returns Summary" description="Customer returns, supplier returns, damaged, and expired goods summary." icon={RefreshCcw} filters={filters} setFilters={setFilters} query={useReturnsSummaryReport(filters)} />; }
export function AdjustmentReportPage() { const [filters, setFilters] = useFilters(); return <ReportShell title="Adjustment Report" description="Stock increase/decrease, damage, expiry, and correction report." icon={ClipboardList} filters={filters} setFilters={setFilters} query={useAdjustmentReport(filters)} />; }
export function InactiveCustomersReportPage() { const [filters, setFilters] = useFilters(); return <ReportShell title="Inactive Customers" description="Distributors, retailers, supermarkets, and institutions with no recent purchases." icon={Users} filters={filters} setFilters={setFilters} query={useInactiveCustomersReport(filters)} />; }
function InventoryAdvancedReportPage({ defaultPeriod = 'today' as ReportPeriod }: { defaultPeriod?: ReportPeriod }) {
  const [filters, setFilters] = useFilters({ period: defaultPeriod });
  const query = useInventoryAdvancedReport(filters);
  const payload = query.data?.data ?? {};
  const summary = payload.summary ?? {};
  const topMovedProducts = payload.top_moved_products ?? [];
  const movementsByType = payload.movements_by_type ?? [];
  const lowStock = payload.low_stock ?? [];
  const recentMovements = payload.recent_movements ?? [];
  const stockBalance = payload.stock_balance ?? [];

  function setPeriod(period: ReportPeriod) {
    if (period === 'custom') {
      setFilters({ ...filters, period });
      return;
    }
    setFilters({ ...filters, period, date_from: undefined, date_to: undefined });
  }

  const exportRows = [
    ...topMovedProducts.map((item: any) => ({ type: 'Ranked Product', rank: item.rank, product: item.product_name, sku: item.sku, total_moved_quantity: item.total_moved_quantity, inbound_quantity: item.inbound_quantity, outbound_quantity: item.outbound_quantity, movement_value: item.movement_value })),
    ...recentMovements.map((movement: any) => ({ type: 'Movement', date: movement.created_at, product: movement.product?.name, warehouse: movement.warehouse?.name, movement_type: movement.movement_type, quantity: movement.quantity, unit_cost: movement.unit_cost })),
    ...lowStock.map((item: any) => ({ type: 'Low Stock', product: item.product_name, sku: item.sku, current_stock: item.current_stock, reorder_level: item.reorder_level })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Warehouse className="h-6 w-6" />
            Inventory Report
          </h1>
          <p className="break-words text-sm text-muted-foreground">
            Filter inventory by today, this week, this month, this year, or a custom date range with ranked products, movement details, low-stock alerts, and stock balances.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button variant="outline" onClick={() => query.refetch?.()}>Refresh</Button>
          <Button variant="outline" onClick={() => downloadCsv('inventory-report.csv', exportRows)}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()}>Print</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Date filter
          </CardTitle>
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
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Input type="date" value={filters.date_from ?? ''} onChange={(event) => setFilters({ ...filters, date_from: event.target.value })} />
              <Input type="date" value={filters.date_to ?? ''} onChange={(event) => setFilters({ ...filters, date_to: event.target.value })} />
              <Button onClick={() => query.refetch?.()}>Apply</Button>
            </div>
          ) : null}

          <div className="break-words text-sm text-muted-foreground">
            Showing: {formatDate(summary.date_from)} - {formatDate(summary.date_to)}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Movements</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{numberValue(summary.movements_count)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Inbound Qty</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{numberValue(summary.inbound_quantity)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Outbound Qty</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{numberValue(summary.outbound_quantity)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Low Stock</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{numberValue(summary.low_stock_count)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Purchased Qty</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{numberValue(summary.purchased_quantity)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Sold Qty</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{numberValue(summary.sold_quantity)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Damaged Qty</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{numberValue(summary.damaged_quantity)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Inbound Value</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{money(summary.inbound_value)}</div></CardContent></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><PackageSearch className="h-5 w-5" />Top moved products ranking</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topMovedProducts.length === 0 ? <p className="break-words text-sm text-muted-foreground">No ranked products found.</p> : topMovedProducts.slice(0, 10).map((item: any, index: number) => (
              <div key={item.product_id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? 'default' : 'secondary'}>#{item.rank ?? index + 1}</Badge>
                  <div>
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-xs text-muted-foreground">{item.category_name ?? 'No category'} • In {numberValue(item.inbound_quantity)} • Out {numberValue(item.outbound_quantity)}</div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium">{numberValue(item.total_moved_quantity)}</div>
                  <div className="text-xs text-muted-foreground">{money(item.movement_value)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Movement by type</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {movementsByType.length === 0 ? <p className="break-words text-sm text-muted-foreground">No movement type data.</p> : movementsByType.map((row: any) => (
              <div key={row.movement_type} className="flex items-center justify-between rounded-lg border p-3">
                <Badge variant="outline" className="capitalize">{String(row.movement_type).replaceAll('_', ' ')}</Badge>
                <div className="text-right text-sm"><div>{numberValue(row.absolute_quantity)} qty</div><div className="text-xs text-muted-foreground">{money(row.movement_value)}</div></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Inventory stock balance</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Current Stock</TableHead><TableHead>Reorder Level</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {query.isLoading ? <TableRow><TableCell colSpan={5}>Loading inventory...</TableCell></TableRow> : stockBalance.length === 0 ? <TableRow><TableCell colSpan={5}>No stock balance found.</TableCell></TableRow> : stockBalance.slice(0, 20).map((item: any) => (
                <TableRow key={item.product_id}>
                  <TableCell><div className="font-medium">{item.product_name}</div><div className="text-xs text-muted-foreground">{item.sku ?? '-'}</div></TableCell>
                  <TableCell>{item.category_name ?? '—'}</TableCell>
                  <TableCell>{numberValue(item.current_stock)}</TableCell>
                  <TableCell>{numberValue(item.reorder_level)}</TableCell>
                  <TableCell>{Number(item.current_stock ?? 0) <= Number(item.reorder_level ?? 0) ? <Badge variant="destructive">Low stock</Badge> : <Badge variant="secondary">Available</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Low stock alerts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {lowStock.length === 0 ? <p className="break-words text-sm text-muted-foreground">No low-stock alerts found.</p> : lowStock.slice(0, 10).map((item: any) => (
              <div key={item.product_id} className="flex items-center justify-between rounded-lg border p-3">
                <div><div className="font-medium">{item.product_name}</div><div className="text-xs text-muted-foreground">{item.category_name ?? 'No category'}</div></div>
                <Badge variant="destructive">{numberValue(item.current_stock)} / {numberValue(item.reorder_level)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent stock movements</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Product</TableHead><TableHead>Warehouse</TableHead><TableHead>Type</TableHead><TableHead>Qty</TableHead></TableRow></TableHeader>
              <TableBody>
                {recentMovements.length === 0 ? <TableRow><TableCell colSpan={5}>No recent movements found.</TableCell></TableRow> : recentMovements.slice(0, 10).map((movement: any) => (
                  <TableRow key={movement.id}>
                    <TableCell>{formatDate(movement.created_at)}</TableCell>
                    <TableCell>{movement.product?.name ?? movement.product_id}</TableCell>
                    <TableCell>{movement.warehouse?.name ?? movement.warehouse_id}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{String(movement.movement_type).replaceAll('_', ' ')}</Badge></TableCell>
                    <TableCell>{numberValue(movement.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


