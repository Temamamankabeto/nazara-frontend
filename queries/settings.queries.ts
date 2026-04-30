import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';

export const settingsKeys = { all: ['settings'] as const, detail: () => [...settingsKeys.all, 'detail'] as const };

export function useSettingsQuery() {
  return useQuery({ queryKey: settingsKeys.detail(), queryFn: settingsService.get });
}
