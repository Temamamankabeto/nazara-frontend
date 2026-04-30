import api from '@/lib/axios';
import type { BranchLite, PaginatedResponse, RoleLite, UserFilters, UserFormPayload, UserRow } from '@/types/user-management.types';

export async function getUsers(params: UserFilters = {}): Promise<PaginatedResponse<UserRow>> {
  const response = await api.get('/users', { params });
  return response.data;
}

export async function getRolesLite(): Promise<{ data: RoleLite[] }> {
  const response = await api.get('/roles-lite');
  return response.data;
}

export async function getBranches(params: { per_page?: number } = {}): Promise<{ data: BranchLite[] }> {
  const response = await api.get('/branches', { params });
  return response.data;
}

export async function createUser(payload: UserFormPayload) {
  const response = await api.post('/users', payload);
  return response.data;
}

export async function updateUser(id: string | number, payload: UserFormPayload) {
  const response = await api.put(`/users/${id}`, payload);
  return response.data;
}

export async function toggleUserStatus(id: string | number) {
  const response = await api.patch(`/users/${id}/toggle`);
  return response.data;
}

export async function assignUserRole(id: string | number, role: string) {
  const response = await api.post(`/users/${id}/roles`, { role });
  return response.data;
}

export async function resetUserPassword(id: string | number, new_password: string) {
  const response = await api.post(`/users/${id}/reset-password`, { new_password });
  return response.data;
}
