'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsService, Patient, PatientQueryParams, CreatePatientData, UpdatePatientData, PaginatedPatientsResponse, PatientStats, HMOEligibilityResponse } from '@/services/patients.service';

const PATIENTS_QUERY_KEY = 'patients';

export function usePatients(params: PatientQueryParams = {}) {
  return useQuery({
    queryKey: [PATIENTS_QUERY_KEY, params],
    queryFn: () => patientsService.getAll(params),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function usePatient(id: string | null) {
  return useQuery({
    queryKey: [PATIENTS_QUERY_KEY, id],
    queryFn: () => patientsService.getById(id!),
    enabled: !!id,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function usePatientStats(clinicId: string | null) {
  return useQuery({
    queryKey: [PATIENTS_QUERY_KEY, 'stats', clinicId],
    queryFn: () => patientsService.getStats(clinicId!),
    enabled: !!clinicId,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePatientData) => patientsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientData }) => patientsService.update(id, data),
    onSuccess: (updatedPatient) => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
      queryClient.setQueryData([PATIENTS_QUERY_KEY, updatedPatient.id], updatedPatient);
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => patientsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
    },
  });
}

export function usePatientsByHMO(hmoName: string | null, clinicId: string | null) {
  return useQuery({
    queryKey: [PATIENTS_QUERY_KEY, 'hmo', hmoName, clinicId],
    queryFn: () => patientsService.getByHMO(hmoName!, clinicId!),
    enabled: !!hmoName && !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useHMOEligibility(patientId: string | null, serviceType: string, serviceAmount: number) {
  return useQuery({
    queryKey: [PATIENTS_QUERY_KEY, 'hmo-eligibility', patientId, serviceType, serviceAmount],
    queryFn: () => patientsService.checkHMOEligibility(patientId!, serviceType, serviceAmount),
    enabled: !!patientId && !!serviceType && serviceAmount > 0,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

export type { Patient, PatientQueryParams, CreatePatientData, UpdatePatientData, PaginatedPatientsResponse, PatientStats, HMOEligibilityResponse };