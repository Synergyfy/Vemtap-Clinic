import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { recordsService, prescriptionsService, CreateRecordData, CreatePrescriptionData } from '@/services/records.service';

// ── Medical Records ──
export function useRecords(params?: { staffId?: string; patientId?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['medical-records', user?.clinicId, params],
    queryFn: () => recordsService.getAll({ ...params, clinicId: user!.clinicId! }),
    enabled: !!user?.clinicId,
  });
}

export function useRecord(id: string | null) {
  return useQuery({
    queryKey: ['medical-record', id],
    queryFn: () => recordsService.getById(id!),
    enabled: !!id,
  });
}

export function usePatientRecords(patientId: string | null) {
  return useQuery({
    queryKey: ['patient-records', patientId],
    queryFn: () => recordsService.getPatientHistory(patientId!),
    enabled: !!patientId,
  });
}

export function useCreateRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecordData) => recordsService.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      queryClient.invalidateQueries({ queryKey: ['patient-records', variables.patientId] });
    },
  });
}

export function useUpdateRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRecordData> }) => recordsService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medical-record', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
    },
  });
}

// ── Prescriptions ──
export function useRecordPrescriptions(recordId: string | null) {
  return useQuery({
    queryKey: ['record-prescriptions', recordId],
    queryFn: () => prescriptionsService.getByRecord(recordId!),
    enabled: !!recordId,
  });
}

export function usePatientPrescriptions(patientId: string | null) {
  return useQuery({
    queryKey: ['patient-prescriptions', patientId],
    queryFn: () => prescriptionsService.getByPatient(patientId!),
    enabled: !!patientId,
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePrescriptionData) => prescriptionsService.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['record-prescriptions', variables.medicalRecordId] });
    },
  });
}
