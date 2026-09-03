import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import {
  nurseQueueService,
  nurseRecordsService,
  nurseNotesService,
  nurseAppointmentsService,
} from '@/services/nurse.service';

// ── Queue ──
export function useNurseQueue() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['nurse-queue', user?.clinicId],
    queryFn: () => nurseQueueService.getEntries(user!.clinicId!),
    enabled: !!user?.clinicId,
    refetchInterval: 15000,
  });
}

export function useCompleteQueueEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => nurseQueueService.complete(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurse-queue'] });
    },
  });
}

// ── Medical Records / Vitals ──
export function usePatientHistory(patientId: string | null) {
  return useQuery({
    queryKey: ['patient-history', patientId],
    queryFn: () => nurseRecordsService.getPatientHistory(patientId!),
    enabled: !!patientId,
  });
}

export function useCreateRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: nurseRecordsService.create,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient-history', variables.patientId] });
    },
  });
}

// ── Observation Notes ──
export function usePatientNotes(patientId: string | null) {
  return useQuery({
    queryKey: ['patient-notes', patientId],
    queryFn: () => nurseNotesService.getByPatient(patientId!),
    enabled: !!patientId,
  });
}

export function useClinicNotes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['clinic-notes', user?.clinicId],
    queryFn: () => nurseNotesService.getByClinic(user!.clinicId!),
    enabled: !!user?.clinicId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: nurseNotesService.create,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clinic-notes'] });
      queryClient.invalidateQueries({ queryKey: ['patient-notes', variables.patientId] });
    },
  });
}

// ── Appointments / Follow-ups ──
export function useNurseAppointments(staffId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['nurse-appointments', staffId, user?.clinicId],
    queryFn: () => nurseAppointmentsService.getByStaff(staffId!, user!.clinicId!),
    enabled: !!staffId && !!user?.clinicId,
  });
}

export function useNurseFollowUps(staffId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['nurse-follow-ups', staffId, user?.clinicId],
    queryFn: () => nurseAppointmentsService.getFollowUps(staffId!, user!.clinicId!),
    enabled: !!staffId && !!user?.clinicId,
  });
}
