import { api } from "@/lib/api";

export type ObservationCategory =
  | "general"
  | "vitals"
  | "treatment"
  | "follow_up"
  | "allergy"
  | "adverse_reaction"
  | "other";

export interface ObservationNote {
  id: string;
  note: string;
  category: ObservationCategory;
  patientId: string;
  staffId?: string | null;
  clinicId: string;
  createdAt: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    mrn?: string;
  };
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
  clinic?: {
    id: string;
    name: string;
  };
}

export interface CreateObservationNoteDto {
  note: string;
  category?: ObservationCategory;
  patientId: string;
  clinicId: string;
  staffId?: string;
}

export interface ObservationNoteQueryDto {
  patientId?: string;
  clinicId?: string;
}

// ─── API Client Methods ───

export async function createObservationNote(
  dto: CreateObservationNoteDto
): Promise<ObservationNote> {
  const { data } = await api.post("/observation-notes", dto);
  return data;
}

export async function listObservationNotes(
  query: ObservationNoteQueryDto = {}
): Promise<ObservationNote[]> {
  const { data } = await api.get("/observation-notes", { params: query });
  return data;
}

export async function getObservationNotesByPatient(
  patientId: string
): Promise<ObservationNote[]> {
  const { data } = await api.get("/observation-notes", {
    params: { patientId },
  });
  return data;
}

export async function getObservationNotesByClinic(
  clinicId: string
): Promise<ObservationNote[]> {
  const { data } = await api.get("/observation-notes", {
    params: { clinicId },
  });
  return data;
}

export async function getObservationNoteById(id: string): Promise<ObservationNote> {
  const { data } = await api.get(`/observation-notes/${id}`);
  return data;
}

export async function deleteObservationNote(id: string): Promise<void> {
  await api.delete(`/observation-notes/${id}`);
}
