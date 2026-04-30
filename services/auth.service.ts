import api from '@/lib/axios';
import { formatUser, LoginPayload, LoginResponse, LogoutResponse } from '@/types/auth.types';

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post('/auth/login', payload);
  const data = response.data?.data ?? response.data;
  return { token: data.token, user: formatUser(data) };
}

export async function fetchAuthenticatedUser() {
  const response = await api.get('/auth/me');
  return formatUser(response.data?.data ?? response.data);
}

export async function logoutUser(): Promise<LogoutResponse> {
  const response = await api.post('/auth/logout');
  return response.data;
}

export async function forgotPassword(payload: { email: string }) {
  const response = await api.post('/auth/forgot-password', payload);
  return response.data;
}

export async function resetPassword(payload: { email: string; token: string; password: string; password_confirmation: string }) {
  const response = await api.post('/auth/reset-password', payload);
  return response.data;
}
