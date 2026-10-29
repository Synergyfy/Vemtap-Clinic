import { api } from "@/lib/api";

export type ProcedureCategory =
  | 'cataract'
  | 'glaucoma'
  | 'refractive'
  | 'corneal'
  | 'retinal'
  | 'oculoplastic'
  | 'pediatric'
  | 'emergency'
  | 'other';

export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning';

export type SurgeryStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export interface SurgicalProcedure {
  id: string;
  name: string;
  description: string | null;
  category: ProcedureCategory;
  estimatedDurationMinutes: number;
  requiredStaff?: string[];
  requiredEquipment?: string[];
  preOpRequirements?: string[];
  postOpInstructions?: string[];
  isActive: boolean;
  clinicId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OperatingRoom {
  id: string;
  name: string;
  description?: string | null;
  status: RoomStatus;
  equipment?: string[];
  capacity?: number;
  isActive: boolean;
  clinicId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SurgerySchedule {
  id: string;
  surgeryNumber: string;
  procedureId: string;
  operatingRoomId: string;
  patientId: string;
  primarySurgeonId: string;
  assistantSurgeonIds?: string[];
  anesthesiologistIds?: string[];
  nurseIds?: string[];
  scheduledStartTime: string;
  scheduledEndTime?: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  status: SurgeryStatus;
  cancellationReason?: string | null;
  preoperativeNotes?: string | null;
  intraoperativeNotes?: string | null;
  postoperativeNotes?: string | null;
  complications?: string | null;
  clinicId: string;
  createdAt: string;
  updatedAt?: string;

  // Relations populated by API
  procedure?: SurgicalProcedure;
  operatingRoom?: OperatingRoom;
  patient?: { id: string; firstName: string; lastName: string; phone?: string };
  primarySurgeon?: { id: string; firstName: string; lastName: string; role?: string };
}

export interface SurgeryStats {
  total: number;
  byStatus: Record<string, number>;
  upcoming: number;
}

export interface AvailableTimeSlot {
  start: string;
  end: string;
}

export interface CreateProcedureDto {
  name: string;
  description?: string;
  category: ProcedureCategory;
  estimatedDurationMinutes: number;
  requiredStaff?: string[];
  requiredEquipment?: string[];
  preOpRequirements?: string[];
  postOpInstructions?: string[];
  isActive?: boolean;
}

export interface UpdateProcedureDto extends Partial<CreateProcedureDto> {}

export interface ProcedureQueryParams {
  category?: ProcedureCategory | string;
  isActive?: boolean;
  clinicId?: string;
}

export interface CreateOperatingRoomDto {
  name: string;
  description?: string;
  status?: RoomStatus;
  equipment?: string[];
  capacity?: number;
  isActive?: boolean;
}

export interface UpdateOperatingRoomDto extends Partial<CreateOperatingRoomDto> {}

export interface OperatingRoomQueryParams {
  status?: RoomStatus | string;
  isActive?: boolean;
  clinicId?: string;
}

export interface CreateSurgeryScheduleDto {
  procedureId: string;
  operatingRoomId: string;
  patientId: string;
  primarySurgeonId: string;
  assistantSurgeonIds?: string[];
  anesthesiologistIds?: string[];
  nurseIds?: string[];
  scheduledStartTime: string;
  scheduledEndTime?: string;
  preoperativeNotes?: string;
}

export interface UpdateSurgeryScheduleDto {
  operatingRoomId?: string;
  primarySurgeonId?: string;
  assistantSurgeonIds?: string[];
  anesthesiologistIds?: string[];
  nurseIds?: string[];
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  status?: SurgeryStatus;
  cancellationReason?: string;
  preoperativeNotes?: string;
  intraoperativeNotes?: string;
  postoperativeNotes?: string;
  complications?: string;
}

export interface SurgeryScheduleQueryParams {
  status?: SurgeryStatus | string;
  patientId?: string;
  surgeonId?: string;
  operatingRoomId?: string;
  startDate?: string;
  endDate?: string;
  clinicId?: string;
}

// ─── PROCEDURES ──────────────────────────────────────────────

export async function listProcedures(clinicId: string, params?: Omit<ProcedureQueryParams, 'clinicId'>): Promise<SurgicalProcedure[]> {
  const { data } = await api.get("/surgery/procedures", { params: { clinicId, ...params } });
  return Array.isArray(data) ? data : data?.data || [];
}

export async function getProcedure(id: string): Promise<SurgicalProcedure> {
  const { data } = await api.get(`/surgery/procedures/${id}`);
  return data;
}

export async function createProcedure(dto: CreateProcedureDto, clinicId: string): Promise<SurgicalProcedure> {
  const { data } = await api.post(`/surgery/procedures?clinicId=${clinicId}`, dto);
  return data;
}

export async function updateProcedure(id: string, dto: UpdateProcedureDto): Promise<SurgicalProcedure> {
  const { data } = await api.put(`/surgery/procedures/${id}`, dto);
  return data;
}

export async function deleteProcedure(id: string): Promise<void> {
  await api.delete(`/surgery/procedures/${id}`);
}

// ─── OPERATING ROOMS ─────────────────────────────────────────

export async function listRooms(clinicId: string, params?: Omit<OperatingRoomQueryParams, 'clinicId'>): Promise<OperatingRoom[]> {
  const { data } = await api.get("/surgery/rooms", { params: { clinicId, ...params } });
  return Array.isArray(data) ? data : data?.data || [];
}

export async function getRoom(id: string): Promise<OperatingRoom> {
  const { data } = await api.get(`/surgery/rooms/${id}`);
  return data;
}

export async function createRoom(dto: CreateOperatingRoomDto, clinicId: string): Promise<OperatingRoom> {
  const { data } = await api.post(`/surgery/rooms?clinicId=${clinicId}`, dto);
  return data;
}

export async function updateRoom(id: string, dto: UpdateOperatingRoomDto): Promise<OperatingRoom> {
  const { data } = await api.put(`/surgery/rooms/${id}`, dto);
  return data;
}

export async function deleteRoom(id: string): Promise<void> {
  await api.delete(`/surgery/rooms/${id}`);
}

// ─── SURGERY SCHEDULES ───────────────────────────────────────

export async function listSchedules(clinicId: string, params?: Omit<SurgeryScheduleQueryParams, 'clinicId'>): Promise<SurgerySchedule[]> {
  const { data } = await api.get("/surgery/schedules", { params: { clinicId, ...params } });
  return Array.isArray(data) ? data : data?.data || [];
}

export async function getSchedule(id: string): Promise<SurgerySchedule> {
  const { data } = await api.get(`/surgery/schedules/${id}`);
  return data;
}

export async function getScheduleStats(clinicId: string): Promise<SurgeryStats> {
  const { data } = await api.get("/surgery/schedules/stats", { params: { clinicId } });
  return data;
}

export async function getAvailableSlots(params: {
  date: string;
  operatingRoomId: string;
  durationMinutes?: number;
}): Promise<AvailableTimeSlot[]> {
  const { data } = await api.get("/surgery/schedules/available-slots", { params });
  return Array.isArray(data) ? data : data?.data || [];
}

export async function createSchedule(dto: CreateSurgeryScheduleDto, clinicId: string): Promise<SurgerySchedule> {
  const { data } = await api.post(`/surgery/schedules?clinicId=${clinicId}`, dto);
  return data;
}

export async function updateSchedule(id: string, dto: UpdateSurgeryScheduleDto): Promise<SurgerySchedule> {
  const { data } = await api.put(`/surgery/schedules/${id}`, dto);
  return data;
}

export async function deleteSchedule(id: string): Promise<void> {
  await api.delete(`/surgery/schedules/${id}`);
}

export const surgeryService = {
  listProcedures,
  getProcedure,
  createProcedure,
  updateProcedure,
  deleteProcedure,
  listRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  listSchedules,
  getSchedule,
  getScheduleStats,
  getAvailableSlots,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
