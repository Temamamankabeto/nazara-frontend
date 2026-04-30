import api from '@/lib/axios';
import type { ApiListResponse, AssignRolePermissionsPayload, PermissionFilters, PermissionFormPayload, PermissionRow, RoleFilters, RoleFormPayload, RoleRow } from '@/types/role-management.types';

export async function getRoles(params: RoleFilters = {}): Promise<ApiListResponse<RoleRow>> {
  const response = await api.get('/roles', { params });
  return response.data;
}

export async function createRole(payload: RoleFormPayload) {
  const response = await api.post('/roles', payload);
  return response.data;
}

export async function updateRole(id: string | number, payload: RoleFormPayload) {
  const response = await api.put(`/roles/${id}`, payload);
  return response.data;
}

export async function getPermissions(params: PermissionFilters = {}): Promise<ApiListResponse<PermissionRow>> {
  const response = await api.get('/permissions', { params });
  return response.data;
}

export async function createPermission(payload: PermissionFormPayload) {
  const response = await api.post('/permissions', payload);
  return response.data;
}

export async function updatePermission(id: string | number, payload: PermissionFormPayload) {
  const response = await api.put(`/permissions/${id}`, payload);
  return response.data;
}

export async function deletePermission(id: string | number) {
  const response = await api.delete(`/permissions/${id}`);
  return response.data;
}

export async function getRolePermissions(id: string | number): Promise<ApiListResponse<string>> {
  const response = await api.get(`/roles/${id}/permissions`);
  return response.data;
}

export async function assignRolePermissions(id: string | number, payload: AssignRolePermissionsPayload) {
  const response = await api.post(`/roles/${id}/permissions`, payload);
  return response.data;
}
