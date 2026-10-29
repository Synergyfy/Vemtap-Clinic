import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
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
  type SurgicalProcedure,
  type OperatingRoom,
  type SurgerySchedule,
  type SurgeryStats,
  type AvailableTimeSlot,
  type ProcedureCategory,
  type RoomStatus,
  type SurgeryStatus,
  type CreateProcedureDto,
  type UpdateProcedureDto,
  type ProcedureQueryParams,
  type CreateOperatingRoomDto,
  type UpdateOperatingRoomDto,
  type OperatingRoomQueryParams,
  type CreateSurgeryScheduleDto,
  type UpdateSurgeryScheduleDto,
  type SurgeryScheduleQueryParams,
} from "@/services/surgery.service";

const SURGERY_KEYS = {
  procedures: (clinicId: string) => ["surgery", "procedures", clinicId] as const,
  procedure: (id: string) => ["surgery", "procedure", id] as const,
  rooms: (clinicId: string) => ["surgery", "rooms", clinicId] as const,
  room: (id: string) => ["surgery", "room", id] as const,
  schedules: (clinicId: string) => ["surgery", "schedules", clinicId] as const,
  schedule: (id: string) => ["surgery", "schedule", id] as const,
  stats: (clinicId: string) => ["surgery", "stats", clinicId] as const,
  slots: (roomId: string, date: string) => ["surgery", "slots", roomId, date] as const,
};

export type {
  SurgicalProcedure,
  OperatingRoom,
  SurgerySchedule,
  SurgeryStats,
  AvailableTimeSlot,
  ProcedureCategory,
  RoomStatus,
  SurgeryStatus,
};

// ─── PROCEDURES HOOKS ────────────────────────────────────────

export function useProcedures(params?: Omit<ProcedureQueryParams, 'clinicId'>) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...SURGERY_KEYS.procedures(user?.clinicId ?? ""), params],
    queryFn: () => listProcedures(user!.clinicId, params),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
  });
}

export function useProcedure(id: string | null) {
  return useQuery({
    queryKey: SURGERY_KEYS.procedure(id ?? ""),
    queryFn: () => getProcedure(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateProcedure() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: CreateProcedureDto) => createProcedure(dto, user!.clinicId),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: SURGERY_KEYS.procedures(user.clinicId) });
    },
  });
}

export function useUpdateProcedure() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProcedureDto }) => updateProcedure(id, dto),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: SURGERY_KEYS.procedures(user.clinicId) });
    },
  });
}

export function useDeleteProcedure() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteProcedure(id),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: SURGERY_KEYS.procedures(user.clinicId) });
    },
  });
}

// ─── ROOMS HOOKS ─────────────────────────────────────────────

export function useRooms(params?: Omit<OperatingRoomQueryParams, 'clinicId'>) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...SURGERY_KEYS.rooms(user?.clinicId ?? ""), params],
    queryFn: () => listRooms(user!.clinicId, params),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
  });
}

export function useRoom(id: string | null) {
  return useQuery({
    queryKey: SURGERY_KEYS.room(id ?? ""),
    queryFn: () => getRoom(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: CreateOperatingRoomDto) => createRoom(dto, user!.clinicId),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: SURGERY_KEYS.rooms(user.clinicId) });
    },
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOperatingRoomDto }) => updateRoom(id, dto),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: SURGERY_KEYS.rooms(user.clinicId) });
    },
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: SURGERY_KEYS.rooms(user.clinicId) });
    },
  });
}

// ─── SCHEDULES HOOKS ─────────────────────────────────────────

export function useSchedules(filters?: Omit<SurgeryScheduleQueryParams, 'clinicId'>) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...SURGERY_KEYS.schedules(user?.clinicId ?? ""), filters],
    queryFn: () => listSchedules(user!.clinicId, filters),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
  });
}

export function useSchedule(id: string | null) {
  return useQuery({
    queryKey: SURGERY_KEYS.schedule(id ?? ""),
    queryFn: () => getSchedule(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useSurgeryStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: SURGERY_KEYS.stats(user?.clinicId ?? ""),
    queryFn: () => getScheduleStats(user!.clinicId),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
  });
}

export function useAvailableSlots(operatingRoomId: string, date: string, durationMinutes?: number) {
  return useQuery({
    queryKey: [...SURGERY_KEYS.slots(operatingRoomId, date), durationMinutes],
    queryFn: () => getAvailableSlots({ operatingRoomId, date, durationMinutes }),
    enabled: !!operatingRoomId && !!date,
    staleTime: 15_000,
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: CreateSurgeryScheduleDto) => createSchedule(dto, user!.clinicId),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: ["surgery", "schedules"] });
        qc.invalidateQueries({ queryKey: ["surgery", "stats"] });
      }
    },
  });
}

export function useUpdateSchedule() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSurgeryScheduleDto }) => updateSchedule(id, dto),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: ["surgery", "schedules"] });
        qc.invalidateQueries({ queryKey: ["surgery", "stats"] });
      }
    },
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: ["surgery", "schedules"] });
        qc.invalidateQueries({ queryKey: ["surgery", "stats"] });
      }
    },
  });
}
