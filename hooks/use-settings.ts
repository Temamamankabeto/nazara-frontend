import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsKeys } from '@/queries/settings.queries';
import { settingsService } from '@/services/settings.service';
import type { SystemSettings } from '@/types/settings.types';

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<SystemSettings>) => settingsService.update(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.all }),
  });
}
