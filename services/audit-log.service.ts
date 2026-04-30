import api from '@/lib/axios';
import type { AuditLogFilters, AuditLogResponse } from '@/types/audit-log.types';

const clean = (params?: AuditLogFilters) => Object.fromEntries(Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== 'all'));

export const auditLogService = {
  list: (params?: AuditLogFilters): Promise<AuditLogResponse> => api.get('/audit-logs', { params: clean(params) }).then((r) => r.data),
};
