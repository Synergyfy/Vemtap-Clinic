import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listObservationNotes,
  getObservationNotesByPatient,
  getObservationNotesByClinic,
  getObservationNoteById,
  createObservationNote,
  deleteObservationNote,
  type ObservationNote,
  type CreateObservationNoteDto,
  type ObservationNoteQueryDto,
  type ObservationCategory,
} from "@/services/observation-notes.service";

export const OBSERVATION_NOTES_KEYS = {
  all: ["observation-notes"] as const,
  byPatient: (patientId: string) => ["observation-notes", "patient", patientId] as const,
  byClinic: (clinicId: string) => ["observation-notes", "clinic", clinicId] as const,
  detail: (id: string) => ["observation-notes", "detail", id] as const,
};

// ─── Queries ───

export function useObservationNotes(query: ObservationNoteQueryDto = {}) {
  const { user } = useAuth();
  const effectiveClinicId = query.clinicId || user?.clinicId || "";

  return useQuery({
    queryKey: query.patientId
      ? OBSERVATION_NOTES_KEYS.byPatient(query.patientId)
      : OBSERVATION_NOTES_KEYS.byClinic(effectiveClinicId),
    queryFn: () => {
      if (query.patientId) return getObservationNotesByPatient(query.patientId);
      if (effectiveClinicId) return getObservationNotesByClinic(effectiveClinicId);
      return listObservationNotes(query);
    },
    enabled: !!(query.patientId || effectiveClinicId),
  });
}

export function usePatientObservationNotes(patientId: string | null | undefined) {
  return useQuery({
    queryKey: OBSERVATION_NOTES_KEYS.byPatient(patientId || ""),
    queryFn: () => getObservationNotesByPatient(patientId!),
    enabled: !!patientId,
  });
}

export function useClinicObservationNotes(clinicId?: string) {
  const { user } = useAuth();
  const targetClinicId = clinicId || user?.clinicId || "";

  return useQuery({
    queryKey: OBSERVATION_NOTES_KEYS.byClinic(targetClinicId),
    queryFn: () => getObservationNotesByClinic(targetClinicId),
    enabled: !!targetClinicId,
  });
}

export function useObservationNote(id: string | null | undefined) {
  return useQuery({
    queryKey: OBSERVATION_NOTES_KEYS.detail(id || ""),
    queryFn: () => getObservationNoteById(id!),
    enabled: !!id,
  });
}

// ─── Mutations ───

export function useCreateObservationNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (dto: Omit<CreateObservationNoteDto, "clinicId"> & { clinicId?: string }) => {
      const clinicId = dto.clinicId || user?.clinicId;
      if (!clinicId) throw new Error("Clinic ID is required");
      return createObservationNote({ ...dto, clinicId });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: OBSERVATION_NOTES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["clinic-notes"] });
      if (variables.patientId) {
        queryClient.invalidateQueries({
          queryKey: OBSERVATION_NOTES_KEYS.byPatient(variables.patientId),
        });
        queryClient.invalidateQueries({
          queryKey: ["patient-notes", variables.patientId],
        });
      }
    },
  });
}

export function useDeleteObservationNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteObservationNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBSERVATION_NOTES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["clinic-notes"] });
      queryClient.invalidateQueries({ queryKey: ["patient-notes"] });
    },
  });
}

export type { ObservationNote, CreateObservationNoteDto, ObservationCategory };
