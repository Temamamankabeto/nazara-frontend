import api from '@/lib/axios';
import type { DashboardResponse } from '@/types/dashboard.types';

export async function getDashboardSummary(): Promise<DashboardResponse> {
  const response = await api.get('/dashboard/summary');
  return response.data;
}
