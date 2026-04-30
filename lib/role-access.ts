export type AppRole = 'General Administrator' | 'Store Keeper' | 'Sales Officer';

export function getPrimaryRole(user: any): string {
  return (
    user?.role ||
    user?.role_name ||
    user?.roles?.[0]?.name ||
    user?.roles?.[0] ||
    'General Administrator'
  );
}

export function normalizeRole(role?: string | null): AppRole {
  const value = String(role ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (['store keeper', 'storekeeper', 'warehouse manager'].includes(value)) return 'Store Keeper';
  if (['sales officer', 'seller', 'sales'].includes(value)) return 'Sales Officer';
  return 'General Administrator';
}

export function getRoleHome(role?: string | null) {
  switch (normalizeRole(role)) {
    case 'Store Keeper':
      return '/dashboard/warehouse';
    case 'Sales Officer':
      return '/dashboard/sales';
    default:
      return '/dashboard/admin';
  }
}

export function canAccessPath(role: string | null | undefined, pathname: string) {
  const normalized = normalizeRole(role);
  const path = pathname.split('?')[0];

  if (normalized === 'General Administrator') return true;

  const storeKeeperPrefixes = [
    '/dashboard/warehouse',
    '/products',
    '/warehouses',
    '/inventory',
    '/transfers',
    '/purchase-orders',
    '/purchase-receivings',
    '/purchase-history',
    '/reports/inventory',
    '/notifications',
    '/account',
  ];

  // Sales Officer scope: no product setup, warehouse, stock, purchase, supplier, settings, users, or audit routes.
  // The only stock-related visibility is read-only product/stock data inside sales order creation and sales reports.
  const salesOfficerPrefixes = [
    '/dashboard/sales',
    '/customers',
    '/sales-orders',
    '/invoices',
    '/payments',
    '/reports/sales',
    '/reports/finance/customer-balances',
    '/notifications',
    '/account',
  ];

  const allowed = normalized === 'Store Keeper' ? storeKeeperPrefixes : salesOfficerPrefixes;
  return allowed.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function getRoleDataScope(user: any) {
  const role = normalizeRole(getPrimaryRole(user));

  if (role === 'General Administrator') return {};

  if (role === 'Store Keeper') {
    return {
      branch_id: user?.branch_id ?? undefined,
      warehouse_id: user?.warehouse_id ?? undefined,
      scope: 'warehouse',
    };
  }

  return {
    branch_id: user?.branch_id ?? undefined,
    sales_officer_id: user?.id ?? undefined,
    created_by: user?.id ?? undefined,
    scope: 'sales',
  };
}
