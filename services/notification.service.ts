import api from '@/lib/axios';
import type { NotificationFilters, NotificationResponse, UnreadNotificationResponse } from '@/types/notification.types';

const clean = (params?: NotificationFilters) => Object.fromEntries(Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== 'all'));

export const notificationService = {
  list: (params?: NotificationFilters): Promise<NotificationResponse> => api.get('/notifications', { params: clean(params) }).then((r) => r.data),
  unreadCount: (): Promise<UnreadNotificationResponse> => api.get('/notifications/unread-count').then((r) => r.data),
  markRead: (id: string): Promise<{ success?: boolean; message?: string }> => api.post(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: (): Promise<{ success?: boolean; message?: string }> => api.post('/notifications/read-all').then((r) => r.data),
};
