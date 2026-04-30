export interface DwmsUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  branch_id?: number | null;
  branch_name?: string | null;
  is_active: boolean;
  role: string;
  roles: string[];
  permissions: string[];
  avatar?: string;
}

export interface LoginPayload { email: string; password: string; }
export interface LoginResponse { token: string; user: DwmsUser; }
export interface LogoutResponse { message?: string; success?: boolean; }

export function formatUser(payload: any): DwmsUser {
  const raw = payload?.user ?? payload ?? {};
  const roles = Array.isArray(payload?.roles)
    ? payload.roles
    : Array.isArray(raw?.roles)
      ? raw.roles.map((role: any) => typeof role === 'string' ? role : role?.name).filter(Boolean)
      : [];
  const permissions = Array.isArray(payload?.permissions)
    ? payload.permissions
    : Array.isArray(raw?.permissions)
      ? raw.permissions.map((permission: any) => typeof permission === 'string' ? permission : permission?.name).filter(Boolean)
      : [];
  return {
    id: String(raw?.id ?? ''),
    name: raw?.name ?? '',
    email: raw?.email ?? '',
    phone: raw?.phone ?? null,
    address: raw?.address ?? null,
    branch_id: raw?.branch_id ?? raw?.branch?.id ?? null,
    branch_name: raw?.branch?.name ?? raw?.branch_name ?? null,
    is_active: Boolean(raw?.is_active ?? true),
    role: roles[0] ?? raw?.role ?? 'Distributor Portal User',
    roles,
    permissions,
    avatar: raw?.avatar ?? '/default-avatar.png',
  };
}
