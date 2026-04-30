import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/services/dashboard.service';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
};

export function useDashboardSummaryQuery(enabled = true) {
  return useQuery({ queryKey: dashboardKeys.summary(), queryFn: getDashboardSummary, enabled });
}
