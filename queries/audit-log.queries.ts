import { useQuery } from '@tanstack/react-query';
import { auditLogService } from '@/services/audit-log.service';
import type { AuditLogFilters } from '@/types/audit-log.types';

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  list: (filters?: AuditLogFilters) => [...auditLogKeys.all, 'list', filters] as const,
};

export function useAuditLogsQuery(filters?: AuditLogFilters) {
  return useQuery({ queryKey: auditLogKeys.list(filters), queryFn: () => auditLogService.list(filters), retry: false });
}
