import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  listClinics,
  getClinicById,
  getClinicStats,
  createClinic,
  updateClinic,
  deleteClinic,
  Clinic,
  CreateClinicInput,
  UpdateClinicInput,
} from '@/services/clinics.service';

const CLINIC_KEYS = {
  all: ['clinics'] as const,
  detail: (id: string) => ['clinics', id] as const,
  stats: ['clinics', 'stats'] as const,
};

export function useClinics(params?: { search?: string; isActive?: boolean; plan?: string }) {
  return useQuery({
    queryKey: [...CLINIC_KEYS.all, params ?? {}],
    queryFn: () => listClinics(params ?? {}),
  });
}

export function useClinic(id: string) {
  return useQuery({
    queryKey: CLINIC_KEYS.detail(id),
    queryFn: () => getClinicById(id),
    enabled: !!id,
  });
}

export function useClinicStats() {
  return useQuery({
    queryKey: CLINIC_KEYS.stats,
    queryFn: getClinicStats,
  });
}

export function useCreateClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateClinicInput) => createClinic(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINIC_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CLINIC_KEYS.stats });
    },
  });
}

export function useUpdateClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateClinicInput }) => updateClinic(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CLINIC_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CLINIC_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: CLINIC_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClinic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINIC_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CLINIC_KEYS.stats });
    },
  });
}
