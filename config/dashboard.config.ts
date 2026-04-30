import { AlertTriangle, BarChart3, ClipboardList, FileText, Package, PackageCheck, ShoppingCart, Truck, Users, Warehouse, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type DashboardRole = 'admin' | 'sales' | 'warehouse' | 'finance' | 'purchase';

export type DashboardQuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
};

export type DashboardDefinition = {
  role: DashboardRole;
  title: string;
  subtitle: string;
  route: string;
  actions: DashboardQuickAction[];
};

export const dashboardDefinitions: Record<DashboardRole, DashboardDefinition> = {
  admin: {
    role: 'admin',
    title: 'Admin Dashboard',
    subtitle: 'Full control center for Pearl Detergent wholesale operations.',
    route: '/dashboard/admin',
    actions: [
      { label: 'Manage users', href: '/users', icon: Users, permission: 'users.read' },
      { label: 'Roles & permissions', href: '/roles-permissions', icon: ClipboardList, permission: 'roles.read' },
      { label: 'System settings', href: '/settings', icon: BarChart3 },
      { label: 'Audit logs', href: '/audit-logs', icon: FileText, permission: 'audit.read' },
    ],
  },
  sales: {
    role: 'sales',
    title: 'Sales Dashboard',
    subtitle: 'Wholesale orders, distributors, invoices, and sales performance.',
    route: '/dashboard/sales',
    actions: [
      { label: 'Customers & distributors', href: '/customers', icon: Users, permission: 'customers.read' },
      { label: 'Sales orders', href: '/sales-orders', icon: ShoppingCart, permission: 'sales_orders.read' },
      { label: 'Delivery notes', href: '/sales-orders/delivery-notes', icon: Truck, permission: 'sales_orders.read' },
      { label: 'Daily sales report', href: '/reports/sales/daily', icon: BarChart3, permission: 'reports.sales.read' },
    ],
  },
  warehouse: {
    role: 'warehouse',
    title: 'Warehouse Dashboard',
    subtitle: 'Stock, warehouses, transfers, low stock, and returns.',
    route: '/dashboard/warehouse',
    actions: [
      { label: 'Warehouses', href: '/warehouses', icon: Warehouse, permission: 'warehouses.read' },
      { label: 'Stock balance', href: '/inventory', icon: Package, permission: 'reports.inventory.read' },
      { label: 'Stock transfers', href: '/transfers', icon: Truck, permission: 'transfers.read' },
      { label: 'Stock adjustments', href: '/inventory', icon: PackageCheck, permission: 'warehouses.update' },
    ],
  },
  finance: {
    role: 'finance',
    title: 'Finance Dashboard',
    subtitle: 'Payments, receivables, overdue invoices, supplier balances, and profit estimates.',
    route: '/dashboard/finance',
    actions: [
      { label: 'Invoices', href: '/invoices', icon: FileText, permission: 'invoices.read' },
      { label: 'Overdue invoices', href: '/invoices/overdue', icon: AlertTriangle, permission: 'reports.financial.read' },
      { label: 'Payments', href: '/payments', icon: Wallet, permission: 'payments.read' },
      { label: 'Payment summary', href: '/reports/finance/payment-summary', icon: BarChart3, permission: 'reports.financial.read' },
    ],
  },
  purchase: {
    role: 'purchase',
    title: 'Purchase Dashboard',
    subtitle: 'Supplier procurement, receiving, invoices, and purchase history.',
    route: '/dashboard/purchase',
    actions: [
      { label: 'Purchase requests', href: '/purchase-requests', icon: ClipboardList, permission: 'purchases.read' },
      { label: 'Purchase orders', href: '/purchase-orders', icon: FileText, permission: 'purchases.read' },
      { label: 'Receive stock', href: '/purchase-receivings', icon: PackageCheck, permission: 'purchases.receive' },
      { label: 'Supplier invoices', href: '/supplier-invoices', icon: Wallet, permission: 'purchases.read' },
    ],
  },
};

export function dashboardRoleFromUserRole(role?: string | null): DashboardRole {
  const normalized = String(role ?? '').toLowerCase();
  if (normalized.includes('sales')) return 'sales';
  if (normalized.includes('warehouse') || normalized.includes('store')) return 'warehouse';
  if (normalized.includes('finance')) return 'finance';
  if (normalized.includes('purchase') || normalized.includes('procurement')) return 'purchase';
  return 'admin';
}
