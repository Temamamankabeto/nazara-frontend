'use client';

import Link from 'next/link';
import { FileText, Package, TrendingUp, Wallet, AlertTriangle, ReceiptText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardRoleFromUserRole, type DashboardQuickAction } from '@/config/dashboard.config';
import { useDashboardSummaryQuery } from '@/queries/dashboard.queries';

function money(value: number | undefined) {
  return `ETB ${Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Define quick links based on user role
function getQuickLinksForUser(user: any): DashboardQuickAction[] {
  const role = dashboardRoleFromUserRole(user?.role);
  
  // Define quick links for different roles
  const quickLinksByRole: Record<string, DashboardQuickAction[]> = {
    admin: [
      { href: '/products', label: 'Manage Products', icon: Package, permission: 'products.read' },
      { href: '/inventory', label: 'Inventory Status', icon: AlertTriangle, permission: 'inventory.read' },
      { href: '/invoices', label: 'View Invoices', icon: FileText, permission: 'invoices.read' },
      { href: '/payments', label: 'Record Payments', icon: Wallet, permission: 'payments.create' },
      { href: '/reports', label: 'Business Reports', icon: TrendingUp, permission: 'reports.analytics.read' },
    ],
    sales: [
      { href: '/sales-orders', label: 'Sales Orders', icon: TrendingUp, permission: 'sales_orders.read' },
      { href: '/customers', label: 'Customers', icon: Wallet, permission: 'customers.read' },
      { href: '/invoices', label: 'Invoices', icon: FileText, permission: 'invoices.read' },
      { href: '/payments', label: 'Payments', icon: ReceiptText, permission: 'payments.read' },
    ],
    warehouse: [
      { href: '/inventory', label: 'Stock Management', icon: Package, permission: 'inventory.read' },
      { href: '/inventory/movements', label: 'Stock Movements', icon: AlertTriangle, permission: 'inventory.movements.read' },
      { href: '/transfers', label: 'Stock Transfers', icon: TrendingUp, permission: 'transfers.read' },
      { href: '/warehouses', label: 'Warehouses', icon: FileText, permission: 'warehouses.read' },
    ],
    finance: [
      { href: '/payments', label: 'Collections', icon: Wallet, permission: 'payments.read' },
      { href: '/invoices', label: 'Invoices', icon: FileText, permission: 'invoices.read' },
      { href: '/reports/finance', label: 'Financial Reports', icon: TrendingUp, permission: 'reports.finance.read' },
      { href: '/reports/finance/customer-balances', label: 'Customer Balances', icon: ReceiptText, permission: 'reports.finance.read' },
    ],
    purchase: [
      { href: '/purchase-orders', label: 'Purchase Orders', icon: Package, permission: 'purchases.read' },
      { href: '/suppliers', label: 'Suppliers', icon: Wallet, permission: 'suppliers.read' },
      { href: '/inventory/receiving', label: 'Receive Stock', icon: AlertTriangle, permission: 'inventory.receive' },
      { href: '/reports/purchase', label: 'Purchase Reports', icon: FileText, permission: 'reports.purchase.read' },
    ],
  };

  return quickLinksByRole[role] || quickLinksByRole.admin;
}

export function DwmsDashboard({ user }: { user: any }) {
  const canReadDashboard = user?.permissions?.includes('reports.analytics.read');
  const summaryQuery = useDashboardSummaryQuery(Boolean(canReadDashboard));
  const summary = summaryQuery.data?.data;
  const quickLinks = getQuickLinksForUser(user);
  const availableQuickLinks = quickLinks.filter((item) => !item.permission || user?.permissions?.includes(item.permission));

  const cards = [
    { title: 'Wholesale Sales', value: money(summary?.sales_total), icon: TrendingUp, description: 'Total sales from sales orders' },
    { title: 'Collections', value: money(summary?.collections_total), icon: Wallet, description: 'Payments collected' },
    { title: 'Receivables', value: money(summary?.receivables_total), icon: ReceiptText, description: 'Open customer balances' },
    { title: 'Active Products', value: String(summary?.active_products ?? 0), icon: Package, description: 'Available detergent catalog items' },
    { title: 'Low Stock Items', value: String(summary?.low_stock_items ?? 0), icon: AlertTriangle, description: 'Products at or below reorder level' },
    { title: 'Overdue Invoices', value: String(summary?.overdue_invoices ?? 0), icon: FileText, description: 'Invoices past due date' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.name} 👋</h1>
        <p className="text-sm text-muted-foreground">Pearl Detergent Wholesale Management System • Branch: {user?.branch_name ?? 'Head Office'} • Role: {user?.role}</p>
      </div>

      {!canReadDashboard ? (
        <Card>
          <CardHeader>
            <CardTitle>Dashboard access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your account does not have <span className="font-medium">reports.analytics.read</span>. 
              Use the sidebar modules available for your role.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summaryQuery.isLoading ? '...' : card.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick access</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          {availableQuickLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quick links available for your role.</p>
          ) : (
            availableQuickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className="flex items-center gap-3 rounded-xl border p-4 text-sm font-medium hover:bg-muted"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}