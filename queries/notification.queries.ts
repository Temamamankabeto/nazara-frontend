import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import type { NotificationFilters } from '@/types/notification.types';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (filters?: NotificationFilters) => [...notificationKeys.all, 'list', filters] as const,
  unread: () => [...notificationKeys.all, 'unread-count'] as const,
};

export function useNotificationsQuery(filters?: NotificationFilters) {
  return useQuery({ queryKey: notificationKeys.list(filters), queryFn: () => notificationService.list(filters) });
}

export function useUnreadNotificationsQuery() {
  return useQuery({ queryKey: notificationKeys.unread(), queryFn: notificationService.unreadCount, refetchInterval: 60000 });
}
