import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listProcedures, createProcedure, updateProcedure, deleteProcedure,
  listRooms, createRoom, updateRoom, deleteRoom,
  listSchedules, getScheduleStats, getAvailableSlots, createSchedule, updateSchedule, deleteSchedule,
  SurgerySchedule,
} from "@/services/surgery.service";

const SURGERY_KEYS = {
  procedures: (clinicId: string) => ["surgery", "procedures", clinicId] as const,
  rooms: (clinicId: string) => ["surgery", "rooms", clinicId] as const,
  schedules: (clinicId: string) => ["surgery", "schedules", clinicId] as const,
  stats: (clinicId: string) => ["surgery", "stats", clinicId] as const,
  slots: (roomId: string, date: string) => ["surgery", "slots", roomId, date] as const,
};

export function useProcedures() {
  const { user } = useAuth();
  return useQuery({
    queryKey: SURGERY_KEYS.procedures(user?.clinicId ?? ""),
    queryFn: () => listProcedures(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCreateProcedure() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { name: string; description: string | null; category: string; duration: number; cost: string }) =>
      createProcedure({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: SURGERY_KEYS.procedures(user.clinicId) }); },
  });
}

export function useRooms() {
  const { user } = useAuth();
  return useQuery({
    queryKey: SURGERY_KEYS.rooms(user?.clinicId ?? ""),
    queryFn: () => listRooms(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { name: string; capacity: number; status: string; equipment: string[] }) =>
      createRoom({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: SURGERY_KEYS.rooms(user.clinicId) }); },
  });
}

export function useSchedules(filters?: { status?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...SURGERY_KEYS.schedules(user?.clinicId ?? ""), filters],
    queryFn: () => listSchedules(user!.clinicId, filters),
    enabled: !!user?.clinicId,
  });
}

export function useSurgeryStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: SURGERY_KEYS.stats(user?.clinicId ?? ""),
    queryFn: () => getScheduleStats(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useAvailableSlots(roomId: string, date: string) {
  return useQuery({
    queryKey: SURGERY_KEYS.slots(roomId, date),
    queryFn: () => getAvailableSlots("", { roomId, date }),
    enabled: !!roomId && !!date,
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { procedureId: string; roomId: string; patientId: string; surgeonId: string; scheduledDate: string; scheduledTime: string; notes: string | null; status: string }) =>
      createSchedule({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: SURGERY_KEYS.schedules(user.clinicId) }); },
  });
}

export function useUpdateSchedule() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<SurgerySchedule> }) => updateSchedule(id, dto),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: SURGERY_KEYS.schedules(user.clinicId) }); },
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: SURGERY_KEYS.schedules(user.clinicId) }); },
  });
}
