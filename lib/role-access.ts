export type AppRole =
  | 'General Administrator'
  | 'Warehouse Manager'
  | 'Sales Officer'
  | 'Auditor'
  | 'Branch Manager'
  | 'Distributor Portal User';

export function getPrimaryRole(user: any): string {
  return user?.role || user?.role_name || user?.roles?.[0]?.name || user?.roles?.[0] || 'General Administrator';
}

export function normalizeRole(role?: string | null): AppRole {
  const value = String(role ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (value === 'warehouse manager') return 'Warehouse Manager';
  if (['sales officer', 'seller', 'sales'].includes(value)) return 'Sales Officer';
  if (value === 'auditor') return 'Auditor';
  if (value === 'branch manager') return 'Branch Manager';
  if (['distributor portal user', 'distributor', 'customer', 'retailer'].includes(value)) return 'Distributor Portal User';
  return 'General Administrator';
}

export function getRoleHome(role?: string | null) {
  switch (normalizeRole(role)) {
    case 'Warehouse Manager': return '/dashboard/warehouse';
    case 'Sales Officer': return '/dashboard/sales';
    case 'Auditor': return '/dashboard/auditor';
    case 'Branch Manager': return '/dashboard/branch';
    case 'Distributor Portal User': return '/customer/dashboard';
    default: return '/dashboard/admin';
  }
}

export function canAccessPath(role: string | null | undefined, pathname: string) {
  const normalized = normalizeRole(role);
  const path = pathname.split('?')[0];
  if (normalized === 'General Administrator') return true;

  const prefixes: Record<Exclude<AppRole, 'General Administrator'>, string[]> = {
    'Warehouse Manager': ['/dashboard/warehouse','/products','/warehouses','/inventory','/transfers','/purchase-orders','/purchase-receivings','/returns','/reports/inventory','/notifications','/account'],
    'Sales Officer': ['/dashboard/sales','/customers','/sales-orders','/suppliers','/purchase-requests','/purchase-orders','/purchase-receivings','/purchase-history','/supplier-invoices','/products','/inventory','/transfers','/returns','/invoices','/payments','/reports/sales','/reports/finance','/reports/inventory','/reports/operations','/notifications','/account'],
    'Auditor': ['/dashboard/auditor','/users','/products','/suppliers','/customers','/warehouses','/sales-orders','/purchase-requests','/purchase-orders','/invoices','/payments','/returns','/reports','/audit-logs','/notifications','/account'],
    'Branch Manager': ['/dashboard/branch','/branches','/users','/products','/warehouses','/customers','/sales-orders','/purchase-orders','/invoices','/payments','/transfers','/returns','/reports','/notifications','/account'],
    'Distributor Portal User': ['/customer','/notifications','/account'],
  };
  return prefixes[normalized].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function getRoleDataScope(user: any) {
  const role = normalizeRole(getPrimaryRole(user));
  if (role === 'General Administrator') return {};
  if (role === 'Warehouse Manager') return { branch_id: user?.branch_id ?? undefined, warehouse_id: user?.warehouse_id ?? undefined, scope: 'warehouse' };
  if (role === 'Sales Officer') return { branch_id: user?.branch_id ?? undefined, sales_officer_id: user?.id ?? undefined, created_by: user?.id ?? undefined, scope: 'sales' };
  return { branch_id: user?.branch_id ?? undefined };
}
