import {
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  FileText,
  KeyRound,
  LayoutDashboard,
  Package,
  PackageCheck,
  PackageSearch,
  PackageX,
  RefreshCcw,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
  Warehouse,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SidebarChildItem = { label: string; href: string; permission?: string };
export type SidebarItem = { label: string; href?: string; icon: LucideIcon; permission?: string; children?: SidebarChildItem[] };
export type SidebarSection = { title: string; items: SidebarItem[] };
export type RoleSidebar = { title: string; icon: LucideIcon; sections: SidebarSection[] };

const s = (title: string, items: SidebarItem[]): SidebarSection => ({ title, items });

export const adminSidebar: RoleSidebar = {
  title: 'Admin', icon: KeyRound, sections: [
    s('Dashboard', [{ label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard }]),
   
    
    s('Reports & Analytics', [{ label: 'Reports & Analytics', icon: BarChart3, children: [
      { label: 'Sales Report', href: '/reports/sales/daily', permission: 'reports.sales.read' },
      { label: 'Sales Reports', href: '/reports/sales/daily', permission: 'reports.sales.read' },
      { label: 'Inventory Reports', href: '/reports/inventory/advanced', permission: 'reports.inventory.read' },
      { label: 'Financial Reports', href: '/reports/finance/payment-summary', permission: 'reports.financial.read' },
      { label: 'Operational Reports', href: '/reports/operations/advanced', permission: 'reports.analytics.read' },
    ] }]),
  ],
};

export const branchManagerSidebar: RoleSidebar = { title: 'Branch Manager', icon: Building2, sections: [
  s('Dashboard', [{ label: 'Dashboard', href: '/dashboard/branch', icon: LayoutDashboard }]),
  s('Branch Operations', [{ label: 'Branch Operations', icon: Building2, children: [
    { label: 'Branch Profile', href: '/branches/profile', permission: 'branches.read' },
    { label: 'Branch Users', href: '/users?scope=branch', permission: 'users.read' },
  ] }]),
  s('Products & Stock', [{ label: 'Products & Stock', icon: Package, children: [
    { label: 'Products', href: '/products', permission: 'products.read' },
    { label: 'Stock Balance', href: '/inventory/stock-balance', permission: 'reports.inventory.read' },
    { label: 'Low Stock Alerts', href: '/inventory/alerts', permission: 'reports.inventory.read' },
  ] }]),
  s('Customers', [{ label: 'Customers', icon: Users, children: [
    { label: 'Customers / Distributors', href: '/customers', permission: 'customers.read' },
    { label: 'Customer Balances', href: '/reports/finance/customer-balances', permission: 'reports.financial.read' },
  ] }]),
  s('Sales', [{ label: 'Sales', icon: ShoppingCart, children: [
    { label: 'Sales Orders', href: '/sales-orders', permission: 'sales_orders.read' },
    { label: 'Delivery Notes', href: '/sales-orders/delivery-notes', permission: 'sales_orders.read' },
    { label: 'Invoices', href: '/invoices', permission: 'invoices.read' },
  ] }]),
  s('Purchases', [{ label: 'Purchases', icon: PackageCheck, children: [
    { label: 'Purchase Orders', href: '/purchase-orders', permission: 'purchases.read' },
    { label: 'Receiving', href: '/purchase-receivings', permission: 'purchases.receive' },
  ] }]),
  s('Reports', [{ label: 'Reports', icon: BarChart3, children: [
    { label: 'Sales Report', href: '/reports/sales/daily', permission: 'reports.sales.read' },
    { label: 'Branch Sales Report', href: '/reports/sales/daily', permission: 'reports.sales.read' },
    { label: 'Branch Inventory Report', href: '/reports/inventory/advanced', permission: 'reports.inventory.read' },
    { label: 'Branch Payment Report', href: '/reports/finance/payment-summary', permission: 'reports.financial.read' },
    { label: 'Branch Operational Report', href: '/reports/operations/advanced', permission: 'reports.analytics.read' },
  ] }]),
  s('System', [{ label: 'Notifications', href: '/notifications', icon: Bell }]),
] };

export const warehouseManagerSidebar: RoleSidebar = { title: 'Warehouse Manager', icon: Warehouse, sections: [
  s('Dashboard', [{ label: 'Dashboard', href: '/dashboard/warehouse', icon: LayoutDashboard }]),
  s('Warehouse Management', [{ label: 'Warehouse Management', icon: Warehouse, children: [
    { label: 'Warehouses', href: '/warehouses', permission: 'warehouses.read' },
    { label: 'Warehouse Stock', href: '/inventory/warehouse-summary', permission: 'reports.inventory.read' },
  ] }]),
  s('Inventory', [{ label: 'Inventory', icon: Boxes, children: [
    { label: 'Stock Balance', href: '/inventory/stock-balance', permission: 'reports.inventory.read' },
    { label: 'Stock Movements', href: '/inventory/stock-movements', permission: 'reports.inventory.read' },
    { label: 'Stock Transfers', href: '/transfers', permission: 'transfers.read' },
    { label: 'Stock Adjustments', href: '/inventory/stock-adjustments', permission: 'warehouses.update' },
    { label: 'Damaged Stock', href: '/inventory/damaged-stock', permission: 'reports.inventory.read' },
    { label: 'Batch Adjustment', href: '/inventory/batches', permission: 'warehouses.update' },
    { label: 'Low Stock Alerts', href: '/inventory/alerts', permission: 'reports.inventory.read' },
  ] }]),
  s('Receiving & Dispatch', [{ label: 'Receiving & Dispatch', icon: PackageCheck, children: [
    { label: 'Purchase Receiving', href: '/purchase-receivings', permission: 'purchases.receive' },
    { label: 'Sales Dispatch', href: '/sales-orders?status=approved', permission: 'sales_orders.read' },
    { label: 'Delivery Notes', href: '/sales-orders/delivery-notes', permission: 'sales_orders.read' },
  ] }]),
  s('Reports', [{ label: 'Reports', icon: BarChart3, children: [
    { label: 'Inventory Report', href: '/reports/inventory/advanced', permission: 'reports.inventory.read' },
    { label: 'Stock Valuation', href: '/inventory/valuation', permission: 'reports.inventory.read' },
    { label: 'Movement History', href: '/inventory/stock-movements', permission: 'reports.inventory.read' },
    { label: 'Warehouse Summary', href: '/inventory/warehouse-summary', permission: 'reports.inventory.read' },
  ] }]),
  s('System', [{ label: 'Notifications', href: '/notifications', icon: Bell }]),
] };

export const salesOfficerSidebar: RoleSidebar = { title: 'Sales Officer', icon: ShoppingCart, sections: [
  s('', [{ label: 'Dashboard', href: '/dashboard/sales', icon: LayoutDashboard }]),
  s('', [{ label: 'Sales Management', icon: ShoppingCart, children: [
    { label: 'Sales Orders', href: '/sales-orders', permission: 'sales_orders.read' },
    { label: 'Delivery Notes', href: '/sales-orders/delivery-notes', permission: 'sales_orders.read' },
    { label: 'Invoices', href: '/invoices', permission: 'invoices.read' },
  ] }]),
  s('', [{ label: 'Procurement', icon: PackageCheck, children: [
    { label: 'Suppliers', href: '/suppliers', permission: 'suppliers.read' },
    { label: 'Purchase Requests', href: '/purchase-requests', permission: 'purchases.read' },
    // { label: 'Purchase Orders', href: '/purchase-orders', permission: 'purchases.read' },
    // { label: 'Purchase Receiving', href: '/purchase-receivings', permission: 'purchases.receive' },
    // { label: 'Supplier Invoices', href: '/supplier-invoices', permission: 'purchases.read' },
    // { label: 'Purchase History', href: '/purchase-history', permission: 'purchases.read' },
  ] }]),
  s('', [{ label: 'Finance', icon: Wallet, children: [
    { label: 'Payments', href: '/payments', permission: 'payments.read' },
    { label: 'Overdue Invoices', href: '/invoices/overdue', permission: 'reports.financial.read' },
    // { label: 'Customer Balances', href: '/reports/finance/customer-balances', permission: 'reports.financial.read' },
    // { label: 'Supplier Balances', href: '/reports/finance/supplier-balances', permission: 'reports.financial.read' },
    { label: 'Payment Summary', href: '/reports/finance/payment-summary', permission: 'reports.financial.read' },
    { label: 'Profit Estimation', href: '/reports/finance/profit-estimation', permission: 'reports.financial.read' },
  ] }]),
  s('', [{ label: 'Stock Operations', icon: Boxes, children: [
    { label: 'Products', href: '/products', permission: 'products.read' },
    { label: 'Inventory', href: '/inventory', permission: 'reports.inventory.read' },
    { label: 'Stock Movements', href: '/inventory/stock-movements', permission: 'reports.inventory.read' },
    { label: 'Stock Transfers', href: '/transfers', permission: 'transfers.read' },
    { label: 'Returns', href: '/returns', permission: 'returns.read' },
    { label: 'Low Stock Alerts', href: '/inventory/alerts', permission: 'reports.inventory.read' },
  ] }]),
  s('', [{ label: 'Reports', icon: BarChart3, children: [
    { label: 'Daily Sales', href: '/reports/sales/daily', permission: 'reports.sales.read' },
    { label: 'Monthly Sales', href: '/reports/sales/monthly', permission: 'reports.sales.read' },
    { label: 'Sales by Region', href: '/reports/sales/by-region', permission: 'reports.sales.read' },
    { label: 'Sales by Distributor', href: '/reports/sales/by-distributor', permission: 'reports.sales.read' },
    { label: 'Top-Selling Products', href: '/reports/sales/top-products', permission: 'reports.sales.read' },
    { label: 'Inventory Report', href: '/reports/inventory/advanced', permission: 'reports.inventory.read' },
    { label: 'Purchase Summary', href: '/reports/operations/purchase-summary', permission: 'reports.purchases.read' },
    { label: 'Operational Report', href: '/reports/operations/advanced', permission: 'reports.analytics.read' },
  ] }]),
  s('System', [{ label: 'Notifications', href: '/notifications', icon: Bell }]),
] };

export const auditorSidebar: RoleSidebar = { title: 'Auditor', icon: ShieldCheck, sections: [
  s('Dashboard', [{ label: 'Dashboard', href: '/dashboard/auditor', icon: LayoutDashboard }]),
  s('Audit Logs', [{ label: 'Audit Logs', icon: ShieldCheck, children: [
    { label: 'User Logins', href: '/audit-logs?type=user_login', permission: 'audit.read' },
    { label: 'Stock Changes', href: '/audit-logs?type=stock_change', permission: 'audit.read' },
    { label: 'Price Updates', href: '/audit-logs?type=price_update', permission: 'audit.read' },
    { label: 'Invoice Edits', href: '/audit-logs?type=invoice_edit', permission: 'audit.read' },
    { label: 'Payment Adjustments', href: '/audit-logs?type=payment_adjustment', permission: 'audit.read' },
    { label: 'Role Changes', href: '/audit-logs?type=role_change', permission: 'audit.read' },
  ] }]),
  s('Reports', [{ label: 'Reports', icon: BarChart3, children: [
    { label: 'Sales Reports', href: '/reports/sales/daily', permission: 'reports.sales.read' },
    { label: 'Inventory Reports', href: '/reports/inventory/advanced', permission: 'reports.inventory.read' },
    { label: 'Financial Reports', href: '/reports/finance/payment-summary', permission: 'reports.financial.read' },
    { label: 'Operational Reports', href: '/reports/operations/advanced', permission: 'reports.analytics.read' },
  ] }]),
  s('Read-Only Views', [{ label: 'Read-Only Views', icon: PackageSearch, children: [
    { label: 'Users', href: '/users', permission: 'users.read' },
    { label: 'Products', href: '/products', permission: 'products.read' },
    { label: 'Customers', href: '/customers', permission: 'customers.read' },
    { label: 'Suppliers', href: '/suppliers', permission: 'suppliers.read' },
    { label: 'Invoices', href: '/invoices', permission: 'invoices.read' },
    { label: 'Payments', href: '/payments', permission: 'payments.read' },
  ] }]),
] };

export const customerSidebar: RoleSidebar = { title: 'Distributor / Customer', icon: Users, sections: [
  s('Dashboard', [{ label: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard }]),
  s('My Orders', [{ label: 'My Orders', icon: ShoppingCart, children: [
    { label: 'Orders', href: '/customer/orders' },
    { label: 'Track Order', href: '/customer/orders/track' },
  ] }]),
  s('My Invoices', [{ label: 'My Invoices', icon: FileText, children: [
    { label: 'Invoices', href: '/customer/invoices' },
    { label: 'Payments', href: '/customer/payments' },
    { label: 'Outstanding Balance', href: '/customer/balance' },
  ] }]),
  s('Account', [
    { label: 'My Profile', href: '/customer/profile', icon: UserCog },
    { label: 'Notifications', href: '/notifications', icon: Bell },
  ]),
] };

export const roleSidebars: Record<string, RoleSidebar> = {
  Admin: adminSidebar, admin: adminSidebar, 'General Administrator': adminSidebar, 'System Administrator': adminSidebar, system_admin: adminSidebar, general_admin: adminSidebar,
  'Branch Manager': branchManagerSidebar, branch_manager: branchManagerSidebar,
  'Warehouse Manager': warehouseManagerSidebar, warehouse_manager: warehouseManagerSidebar,
  'Sales Officer': salesOfficerSidebar, sales_officer: salesOfficerSidebar,
  Auditor: auditorSidebar, auditor: auditorSidebar,
  Distributor: customerSidebar, distributor: customerSidebar, Customer: customerSidebar, customer: customerSidebar, Retailer: customerSidebar, retailer: customerSidebar,
};

function canSee(permission: string | undefined, permissions: string[]) {
  if (!permission) return true;
  return permissions.includes(permission) || permissions.includes('*') || permissions.includes('super-admin');
}
const itemHref = (item: SidebarItem) => item.href ?? item.children?.[0]?.href ?? '#';

export function filterSidebarByPermissions(sidebar: RoleSidebar, permissions: string[]): RoleSidebar {
  return {
    ...sidebar,
    sections: sidebar.sections
      .map((sidebarSection) => ({
        ...sidebarSection,
        items: sidebarSection.items
          .map((item) => {
            const children = item.children?.filter((child) => canSee(child.permission ?? item.permission, permissions));
            const visible = canSee(item.permission, permissions) || Boolean(children?.length);
            if (!visible) return null;
            return { ...item, href: itemHref(item), children } as SidebarItem;
          })
          .filter(Boolean) as SidebarItem[],
      }))
      .filter((sidebarSection) => sidebarSection.items.length > 0),
  };
}

export function getSidebarForRole(role?: string | null) {
  const normalized = (role ?? '').trim();
  return roleSidebars[normalized] ?? adminSidebar;
}

export const allSidebarItems = Object.values(roleSidebars).flatMap((sidebar) => sidebar.sections.flatMap((section) => section.items));
