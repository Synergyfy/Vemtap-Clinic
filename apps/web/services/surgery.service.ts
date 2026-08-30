import { api } from "@/lib/api";

export interface SurgicalProcedure {
  id: string;
  name: string;
  description: string | null;
  category: string;
  duration: number;
  cost: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperatingRoom {
  id: string;
  name: string;
  capacity: number;
  status: string;
  equipment: string[];
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurgerySchedule {
  id: string;
  procedureId: string;
  roomId: string;
  patientId: string;
  surgeonId: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  notes: string | null;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  procedure?: SurgicalProcedure;
  room?: OperatingRoom;
  patient?: { id: string; firstName: string; lastName: string };
  surgeon?: { id: string; firstName: string; lastName: string };
}

// Procedures
export async function listProcedures(clinicId: string): Promise<SurgicalProcedure[]> {
  const { data } = await api.get("/surgery/procedures", { params: { clinicId } });
  return data;
}

export async function createProcedure(dto: Omit<SurgicalProcedure, "id" | "createdAt" | "updatedAt">): Promise<SurgicalProcedure> {
  const { data } = await api.post("/surgery/procedures", dto);
  return data;
}

export async function updateProcedure(id: string, dto: Partial<SurgicalProcedure>): Promise<SurgicalProcedure> {
  const { data } = await api.put(`/surgery/procedures/${id}`, dto);
  return data;
}

export async function deleteProcedure(id: string): Promise<void> {
  await api.delete(`/surgery/procedures/${id}`);
}

// Rooms
export async function listRooms(clinicId: string): Promise<OperatingRoom[]> {
  const { data } = await api.get("/surgery/rooms", { params: { clinicId } });
  return data;
}

export async function createRoom(dto: Omit<OperatingRoom, "id" | "createdAt" | "updatedAt">): Promise<OperatingRoom> {
  const { data } = await api.post("/surgery/rooms", dto);
  return data;
}

export async function updateRoom(id: string, dto: Partial<OperatingRoom>): Promise<OperatingRoom> {
  const { data } = await api.put(`/surgery/rooms/${id}`, dto);
  return data;
}

export async function deleteRoom(id: string): Promise<void> {
  await api.delete(`/surgery/rooms/${id}`);
}

// Schedules
export async function listSchedules(clinicId: string, params?: { status?: string }): Promise<SurgerySchedule[]> {
  const { data } = await api.get("/surgery/schedules", { params: { clinicId, ...params } });
  return data;
}

export async function getScheduleStats(clinicId: string): Promise<any> {
  const { data } = await api.get("/surgery/schedules/stats", { params: { clinicId } });
  return data;
}

export async function getAvailableSlots(clinicId: string, params: { roomId: string; date: string }): Promise<any[]> {
  const { data } = await api.get("/surgery/schedules/available-slots", { params: { clinicId, ...params } });
  return data;
}

export async function createSchedule(dto: Omit<SurgerySchedule, "id" | "createdAt" | "updatedAt">): Promise<SurgerySchedule> {
  const { data } = await api.post("/surgery/schedules", dto);
  return data;
}

export async function updateSchedule(id: string, dto: Partial<SurgerySchedule>): Promise<SurgerySchedule> {
  const { data } = await api.put(`/surgery/schedules/${id}`, dto);
  return data;
}

export async function deleteSchedule(id: string): Promise<void> {
  await api.delete(`/surgery/schedules/${id}`);
}
