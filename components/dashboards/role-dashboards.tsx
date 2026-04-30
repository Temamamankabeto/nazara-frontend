'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  AlertTriangle,
  ArrowRightLeft,
  ClipboardList,
  CreditCard,
  FileText,
  Package,
  ReceiptText,
  TrendingUp,
  Wallet,
  Warehouse,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { useDashboardSummaryQuery } from '@/queries/dashboard.queries';
import {
  useCustomerBalancesReport,
  useSupplierBalancesReport,
} from '@/queries/report.queries';
import {
  useLowStockAlertsQuery,
  useStockBalanceQuery,
  useStockMovementsQuery,
  useWarehouseSummaryQuery,
} from '@/queries/inventory.queries';
import { usePaymentsQuery } from '@/queries/payment.queries';
import { useInvoicesQuery } from '@/queries/invoice.queries';

import {
  dashboardDefinitions,
  dashboardRoleFromUserRole,
  type DashboardQuickAction,
  type DashboardRole,
} from '@/config/dashboard.config';

import type { RootState } from '@/stores';

const money = (value: unknown) =>
  `ETB ${Number(value ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;

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

type IconType = React.ComponentType<{ className?: string }>;
type LooseRecord = Record<string, unknown>;

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  note,
}: {
  title: string;
  value: string | number;
  icon: IconType;
  href?: string;
  note?: string;
}) {
  const body = (
    <Card className="transition hover:shadow-md">
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

  return href ? <Link href={href}>{body}</Link> : body;
}

function getText(row: LooseRecord, keys: string[], fallback = '—') {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }

    if (value && typeof value === 'object' && 'name' in value) {
      const nestedName = (value as { name?: unknown }).name;
      if (typeof nestedName === 'string' || typeof nestedName === 'number') {
        return String(nestedName);
      }
    }
  }

  return fallback;
}

function getNumber(row: LooseRecord, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === 'number') return value;

    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return fallback;
}

function QuickAction({ action }: { action: DashboardQuickAction }) {
  const Icon = action.icon;

  return (
    <Button asChild variant="outline" className="justify-start">
      <Link href={action.href}>
        <Icon className="mr-2 h-4 w-4" />
        {action.label}
      </Link>
    </Button>
  );
}

function DashboardShell({
  role,
  children,
}: {
  role: DashboardRole;
  children: React.ReactNode;
}) {
  const definition = dashboardDefinitions[role];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{definition.title}</h1>
          <p className="text-sm text-muted-foreground">{definition.subtitle}</p>
        </div>

        <Button asChild>
          <Link href="/reports">Open reports</Link>
        </Button>
      </div>

      {children}
    </div>
  );
}

function SharedSummaryCards() {
  const summaryQuery = useDashboardSummaryQuery();
  const data = summaryQuery.data?.data;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <StatCard title="Sales total" value={money(data?.sales_total)} icon={TrendingUp} href="/reports/sales/daily" />
      <StatCard title="Collections" value={money(data?.collections_total)} icon={Wallet} href="/payments" />
      <StatCard title="Receivables" value={money(data?.receivables_total)} icon={FileText} href="/reports/finance/customer-balances" />
      <StatCard title="Active products" value={data?.active_products ?? 0} icon={Package} href="/products" />
      <StatCard title="Low stock" value={data?.low_stock_items ?? 0} icon={AlertTriangle} href="/inventory" />
      <StatCard title="Overdue invoices" value={data?.overdue_invoices ?? 0} icon={FileText} href="/invoices" />
    </div>
  );
}

function FinanceSummaryCards() {
  const summaryQuery = useDashboardSummaryQuery();
  const paymentsQuery = usePaymentsQuery({
    page: 1,
    per_page: 10,
    status: 'all',
    method: 'all',
  });
  const invoicesQuery = useInvoicesQuery({
    page: 1,
    per_page: 10,
    status: 'all',
  });

  const data = summaryQuery.data?.data;
  const payments = paymentsQuery.data?.data ?? [];
  const invoices = invoicesQuery.data?.data ?? [];

  const collectedOnPage = payments.reduce(
    (sum, payment) => sum + Number(payment.amount ?? 0),
    0,
  );

  const outstandingOnPage = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.balance ?? 0),
    0,
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <StatCard title="Collections" value={money(data?.collections_total ?? collectedOnPage)} icon={Wallet} href="/payments" note="Total received" />
      <StatCard title="Receivables" value={money(data?.receivables_total ?? outstandingOnPage)} icon={FileText} href="/reports/finance/customer-balances" note="Customer balances" />
      <StatCard title="Sales total" value={money(data?.sales_total)} icon={TrendingUp} href="/reports/sales/daily" note="Sales revenue" />
      <StatCard title="Payments on page" value={money(collectedOnPage)} icon={CreditCard} href="/payments" note="Current page total" />
      <StatCard title="Outstanding on page" value={money(outstandingOnPage)} icon={ReceiptText} href="/invoices" note="Invoice balances" />
      <StatCard title="Overdue invoices" value={data?.overdue_invoices ?? 0} icon={AlertTriangle} href="/invoices" note="Need follow-up" />
    </div>
  );
}

function WarehouseSummaryCards() {
  const stockQuery = useStockBalanceQuery({ per_page: 10 });
  const lowStockQuery = useLowStockAlertsQuery({ per_page: 10 });
  const movementQuery = useStockMovementsQuery({ per_page: 10 });
  const warehouseSummaryQuery = useWarehouseSummaryQuery({ per_page: 10 });

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Inventory products" value={stockQuery.data?.meta?.total ?? 0} icon={Package} href="/inventory" note="Product-first stock index" />
      <StatCard title="Low stock items" value={lowStockQuery.data?.meta?.total ?? 0} icon={AlertTriangle} href="/inventory" note="Need reorder" />
      <StatCard title="Stock movements" value={movementQuery.data?.meta?.total ?? 0} icon={ClipboardList} href="/inventory/movements" note="Latest stock activity" />
      <StatCard title="Warehouses" value={warehouseSummaryQuery.data?.meta?.total ?? 0} icon={Warehouse} href="/warehouses" note="Active warehouse records" />
    </div>
  );
}

function QuickActionsPanel({ role }: { role: DashboardRole }) {
  const definition = dashboardDefinitions[role];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-2">
        {definition.actions.map((action) => (
          <QuickAction key={action.href} action={action} />
        ))}
      </CardContent>
    </Card>
  );
}

function FinanceQuickActionsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance actions</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-2">
        <Button asChild variant="outline" className="justify-start">
          <Link href="/payments">
            <Wallet className="mr-2 h-4 w-4" />
            Record payments
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start">
          <Link href="/invoices">
            <ReceiptText className="mr-2 h-4 w-4" />
            Manage invoices
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start">
          <Link href="/reports/finance/customer-balances">
            <FileText className="mr-2 h-4 w-4" />
            Customer balances
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start">
          <Link href="/reports/finance/supplier-balances">
            <FileText className="mr-2 h-4 w-4" />
            Supplier balances
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function LowStockPanel() {
  const lowStock = useLowStockAlertsQuery({ per_page: 8 });
  const rows = lowStock.data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Low stock alerts
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {lowStock.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading low stock...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No low-stock alerts found.</p>
        ) : (
          rows.slice(0, 6).map((row) => {
            // Convert to LooseRecord safely using unknown first
            const record = row as unknown as LooseRecord;
            const current = getNumber(record, ['current_stock', 'stock_balance']);
            const reorder = getNumber(record, ['reorder_level']);
            const percent = reorder > 0 ? Math.min(100, Math.round((current / reorder) * 100)) : 0;

            return (
              <div key={String(record.id ?? record.product_id)} className="space-y-1 rounded-xl border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{getText(record, ['name', 'product'], 'Product')}</span>
                  <Badge variant="secondary">
                    {current} / {reorder}
                  </Badge>
                </div>

                <Progress value={percent} />
              </div>
            );
          })
        )}

        <Button asChild variant="outline" className="w-full">
          <Link href="/inventory">View inventory</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function RecentMovementsPanel() {
  const movementQuery = useStockMovementsQuery({ per_page: 6 });
  const rows = movementQuery.data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Recent stock movements
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {movementQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading movements...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent movements found.</p>
        ) : (
          rows.map((row) => {
            const record = row as unknown as LooseRecord;

            return (
              <div key={String(record.id)} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="font-medium">{getText(record, ['product'], `Product #${String(record.product_id ?? '')}`)}</p>
                  <p className="text-xs text-muted-foreground">
                    {getText(record, ['warehouse'], `Warehouse #${String(record.warehouse_id ?? '')}`)}
                  </p>
                </div>

                <div className="text-right">
                  <Badge variant="outline">{String(record.movement_type ?? 'movement')}</Badge>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Qty: {getNumber(record, ['quantity']).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}

        <Button asChild variant="outline" className="w-full">
          <Link href="/inventory/stock-movements">View movements</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function WarehouseOperationsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Warehouse operations</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-2">
        <Button asChild variant="outline" className="justify-start">
          <Link href="/inventory">
            <Package className="mr-2 h-4 w-4" />
            Inventory center
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start">
          <Link href="/inventory/movements">
            <ClipboardList className="mr-2 h-4 w-4" />
            Stock movements
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start">
          <Link href="/transfers">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Stock transfers
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start">
          <Link href="/inventory/reports">
            <FileText className="mr-2 h-4 w-4" />
            Inventory reports
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function CustomerBalancePanel() {
  const query = useCustomerBalancesReport({});
  const rows = Array.isArray(query.data?.data) ? query.data.data.slice(0, 6) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer outstanding balances</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading balances...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No customer balance data found.</p>
        ) : (
          rows.map((row, index) => {
            const record = row as unknown as LooseRecord;

            return (
              <div key={String(record.id ?? index)} className="flex items-center justify-between rounded-xl border p-3">
                <span className="font-medium">{getText(record, ['customer', 'name'], 'Customer')}</span>
                <Badge>{money(getNumber(record, ['balance', 'balance_after', 'total_balance']))}</Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function SupplierBalancePanel() {
  const query = useSupplierBalancesReport({});
  const rows = Array.isArray(query.data?.data) ? query.data.data.slice(0, 6) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier balances</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading balances...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No supplier balance data found.</p>
        ) : (
          rows.map((row, index) => {
            const record = row as unknown as LooseRecord;

            return (
              <div key={String(record.id ?? index)} className="flex items-center justify-between rounded-xl border p-3">
                <span className="font-medium">{getText(record, ['supplier', 'name'], 'Supplier')}</span>
                <Badge>{money(getNumber(record, ['balance', 'balance_after', 'total_balance']))}</Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function RecentPaymentsPanel() {
  const query = usePaymentsQuery({ page: 1, per_page: 6, status: 'all', method: 'all' });
  const rows = query.data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent payments</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading payments...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent payments found.</p>
        ) : (
          rows.map((payment) => {
            const record = payment as unknown as LooseRecord;

            return (
              <div key={String(record.id)} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="font-medium">{getText(record, ['customer', 'customer_id'], 'Customer')}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(String(record.payment_date ?? ''))} • {String(record.method ?? '').replaceAll('_', ' ')}
                  </p>
                </div>

                <Badge variant="secondary">{money(getNumber(record, ['amount']))}</Badge>
              </div>
            );
          })
        )}

        <Button asChild variant="outline" className="w-full">
          <Link href="/payments">View payments</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function OverdueInvoicesPanel() {
  const query = useInvoicesQuery({ page: 1, per_page: 10, status: 'all' });
  const invoices = query.data?.data ?? [];

  const overdue = invoices.filter((invoice) => {
    const record = invoice as unknown as LooseRecord;
    const dueDate = record.due_date;

    if (!dueDate) return false;

    return getNumber(record, ['balance']) > 0 && new Date(String(dueDate)) < new Date();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overdue invoices</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading invoices...</p>
        ) : overdue.length === 0 ? (
          <p className="text-sm text-muted-foreground">No overdue invoices found.</p>
        ) : (
          overdue.slice(0, 6).map((invoice) => {
            const record = invoice as unknown as LooseRecord;

            return (
              <div key={String(record.id)} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="font-medium">{String(record.invoice_number ?? `INV-${String(record.id)}`)}</p>
                  <p className="text-xs text-muted-foreground">
                    Due: {formatDate(String(record.due_date ?? ''))} • {getText(record, ['customer', 'customer_id'], 'Customer')}
                  </p>
                </div>

                <Badge variant="destructive">{money(getNumber(record, ['balance']))}</Badge>
              </div>
            );
          })
        )}

        <Button asChild variant="outline" className="w-full">
          <Link href="/invoices">View invoices</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function FocusPanel({ role }: { role: DashboardRole }) {
  const messages: Record<DashboardRole, string> = {
    admin: 'Review users, roles, audit logs, system settings, and business-wide reports.',
    sales: 'Approve pending orders, dispatch approved orders, and follow customer balances.',
    warehouse: 'Monitor low stock, transfers, stock adjustments, damaged stock, and warehouse balances.',
    finance: 'Follow collections, overdue invoices, customer balances, supplier balances, and payment summaries.',
    purchase: 'Convert purchase requests to orders, receive stock, and reconcile supplier invoices.',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended focus</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="rounded-xl border p-3 text-sm text-muted-foreground">
          {messages[role]}
        </div>
      </CardContent>
    </Card>
  );
}

function FinanceDashboardContent() {
  return (
    <DashboardShell role="finance">
      <FinanceSummaryCards />

      <div className="grid gap-4 xl:grid-cols-3">
        <FinanceQuickActionsPanel />
        <RecentPaymentsPanel />
        <OverdueInvoicesPanel />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CustomerBalancePanel />
        <SupplierBalancePanel />
      </div>
    </DashboardShell>
  );
}

function DashboardContent({ role }: { role: DashboardRole }) {
  const showLowStock = role === 'admin' || role === 'warehouse' || role === 'purchase';
  const showCustomerBalance = role === 'admin' || role === 'sales' || role === 'finance';
  const showSupplierBalance = role === 'finance' || role === 'purchase';

  if (role === 'finance') {
    return <FinanceDashboardContent />;
  }

  if (role === 'warehouse') {
    return (
      <DashboardShell role={role}>
        <WarehouseSummaryCards />

        <div className="grid gap-4 xl:grid-cols-3">
          <WarehouseOperationsPanel />
          <LowStockPanel />
          <RecentMovementsPanel />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role={role}>
      <SharedSummaryCards />

      <div className="grid gap-4 xl:grid-cols-3">
        <QuickActionsPanel role={role} />

        {showLowStock ? (
          <LowStockPanel />
        ) : showCustomerBalance ? (
          <CustomerBalancePanel />
        ) : (
          <FocusPanel role={role} />
        )}

        {showSupplierBalance ? (
          <SupplierBalancePanel />
        ) : showCustomerBalance ? (
          <CustomerBalancePanel />
        ) : (
          <FocusPanel role={role} />
        )}
      </div>
    </DashboardShell>
  );
}

export function AdminDashboard() {
  return <DashboardContent role="admin" />;
}

export function SalesDashboard() {
  return <DashboardContent role="sales" />;
}

export function WarehouseDashboard() {
  return <DashboardContent role="warehouse" />;
}

export function FinanceDashboard() {
  return <DashboardContent role="finance" />;
}

export function PurchaseDashboard() {
  return <DashboardContent role="purchase" />;
}

export default function RoleBasedDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = dashboardRoleFromUserRole(user?.role);

  return <DashboardContent role={role} />;
}