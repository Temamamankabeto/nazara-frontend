import api from '@/lib/axios';
import type { BranchFilters, BranchFormPayload, BranchRow, PaginatedResponse } from '@/types/branch.types';

export async function getBranches(params: BranchFilters = {}): Promise<PaginatedResponse<BranchRow>> {
  const response = await api.get('/branches', { params });
  return response.data;
}

export async function createBranch(payload: BranchFormPayload) {
  const response = await api.post('/branches', payload);
  return response.data;
}

export async function updateBranch(id: string | number, payload: BranchFormPayload) {
  const response = await api.put(`/branches/${id}`, payload);
  return response.data;
}
