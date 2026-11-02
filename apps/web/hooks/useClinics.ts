import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  listClinics,
  getClinicById,
  getClinicStats,
  getPlatformOverview,
  createClinic,
  updateClinic,
  deleteClinic,
  Clinic,
  ClinicStats,
  PlatformOverview,
  CreateClinicInput,
  UpdateClinicInput,
} from '@/services/clinics.service';

const CLINIC_KEYS = {
  all: ['clinics'] as const,
  detail: (id: string) => ['clinics', id] as const,
  stats: ['clinics', 'stats'] as const,
  overview: ['clinics', 'platform-overview'] as const,
};

export function useClinics(params?: { search?: string; isActive?: boolean; plan?: string }) {
  const { user } = useAuth();
  const userKey = user?.userId ?? 'anonymous';

  return useQuery({
    queryKey: [...CLINIC_KEYS.all, userKey, params ?? {}],
    queryFn: () => listClinics(params ?? {}),
    enabled: !!user || userKey === 'anonymous',
  });
}

export function useClinic(id: string) {
  const { user } = useAuth();
  const userKey = user?.userId ?? 'anonymous';

  return useQuery({
    queryKey: [...CLINIC_KEYS.detail(id), userKey],
    queryFn: () => getClinicById(id),
    enabled: !!id,
  });
}

export function useClinicStats() {
  const { user } = useAuth();
  const userKey = user?.userId ?? 'anonymous';

  return useQuery({
    queryKey: [...CLINIC_KEYS.stats, userKey],
    queryFn: getClinicStats,
    enabled: !!user || userKey === 'anonymous',
  });
}

export function usePlatformOverview() {
  const { user } = useAuth();
  const userKey = user?.userId ?? 'anonymous';

  return useQuery({
    queryKey: [...CLINIC_KEYS.overview, userKey],
    queryFn: getPlatformOverview,
    retry: 1,
    staleTime: 30000,
    enabled: !!user || userKey === 'anonymous',
  });
}

export function useCreateClinic() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userKey = user?.userId ?? 'anonymous';

  return useMutation({
    mutationFn: (dto: CreateClinicInput) => createClinic(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CLINIC_KEYS.all, userKey] });
      queryClient.invalidateQueries({ queryKey: [...CLINIC_KEYS.stats, userKey] });
    },
  });
}

export function useUpdateClinic() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userKey = user?.userId ?? 'anonymous';

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateClinicInput }) => updateClinic(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...CLINIC_KEYS.all, userKey] });
      queryClient.invalidateQueries({ queryKey: [...CLINIC_KEYS.stats, userKey] });
      queryClient.invalidateQueries({ queryKey: [...CLINIC_KEYS.detail(variables.id), userKey] });
    },
  });
}

export function useDeleteClinic() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userKey = user?.userId ?? 'anonymous';

  return useMutation({
    mutationFn: (id: string) => deleteClinic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CLINIC_KEYS.all, userKey] });
      queryClient.invalidateQueries({ queryKey: [...CLINIC_KEYS.stats, userKey] });
    },
  });
}
