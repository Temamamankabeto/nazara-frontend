import { BarChart3, ClipboardList, FileText, Package, PackageCheck, ShoppingCart, Truck, Users, Warehouse, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type DashboardRole = 'admin' | 'sales' | 'warehouse';

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
    subtitle: 'Full control center for Nazara Detergents wholesale operations.',
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
    title: 'Sales & Operations Dashboard',
    subtitle: 'Sales, procurement, receiving, payments, inventory operations, and financial follow-up.',
    route: '/dashboard/sales',
    actions: [
      { label: 'Sales orders', href: '/sales-orders', icon: ShoppingCart, permission: 'sales_orders.read' },
      { label: 'Purchase requests', href: '/purchase-requests', icon: ClipboardList, permission: 'purchases.read' },
      { label: 'Receive stock', href: '/purchase-receivings', icon: PackageCheck, permission: 'purchases.receive' },
      { label: 'Record payments', href: '/payments', icon: Wallet, permission: 'payments.create' },
      { label: 'Suppliers', href: '/suppliers', icon: Truck, permission: 'suppliers.read' },
      { label: 'Inventory', href: '/inventory', icon: Package, permission: 'reports.inventory.read' },
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
      { label: 'Stock adjustments', href: '/inventory/stock-adjustments', icon: PackageCheck, permission: 'warehouses.update' },
    ],
  },
};

export function dashboardRoleFromUserRole(role?: string | null): DashboardRole {
  const normalized = String(role ?? '').trim().toLowerCase();
  if (normalized.includes('sales')) return 'sales';
  if (normalized.includes('warehouse')) return 'warehouse';
  return 'admin';
}
