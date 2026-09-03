import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  getSettingsMap, getCategorySettings, setSetting, bulkSetSettings,
  type SetSettingData,
} from "@/services/settings.service";

const SETTINGS_KEYS = {
  all: (clinicId: string) => ["settings", "all", clinicId] as const,
  category: (clinicId: string, category: string) => ["settings", "category", clinicId, category] as const,
};

export function useSettingsMap() {
  const { user } = useAuth();
  return useQuery({
    queryKey: SETTINGS_KEYS.all(user?.clinicId ?? ""),
    queryFn: () => getSettingsMap(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCategorySettings(category: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: SETTINGS_KEYS.category(user?.clinicId ?? "", category),
    queryFn: () => getCategorySettings(user!.clinicId, category),
    enabled: !!user?.clinicId,
  });
}

export function useSetSetting() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: SetSettingData) => setSetting(user!.clinicId, dto),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: SETTINGS_KEYS.all(user.clinicId) });
      }
    },
  });
}

export function useBulkSetSettings() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (settings: SetSettingData[]) => bulkSetSettings(user!.clinicId, settings),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: SETTINGS_KEYS.all(user.clinicId) });
      }
    },
  });
}
