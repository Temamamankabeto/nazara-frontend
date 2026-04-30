export type AuditLog = {
  id: string | number;
  user_id?: string | number | null;
  user?: { id?: string | number; name?: string; email?: string } | null;
  action?: string;
  module?: string;
  auditable_type?: string;
  auditable_id?: string | number | null;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  created_at?: string;
};

export type AuditLogFilters = {
  search?: string;
  module?: string;
  action?: string;
  user_id?: string | number;
  date_from?: string;
  date_to?: string;
  per_page?: number;
};

export type AuditLogResponse = {
  success?: boolean;
  data: AuditLog[];
  meta?: Record<string, any>;
};
