import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listTasks,
  getTask,
  createTask,
  updateTaskStatus,
  deleteTask,
  type StaffTask,
  type StaffTaskQueryParams,
  type CreateStaffTaskDto,
  type TaskStatus,
  type TaskPriority,
} from "@/services/staff-tasks.service";

const TASK_KEYS = {
  all: (clinicId: string) => ["staff-tasks", clinicId] as const,
  detail: (id: string) => ["staff-tasks", "detail", id] as const,
};

export type { StaffTask, TaskStatus, TaskPriority, CreateStaffTaskDto, StaffTaskQueryParams };

export function useTasks(filters?: Omit<StaffTaskQueryParams, "clinicId">) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...TASK_KEYS.all(user?.clinicId ?? ""), filters],
    queryFn: () => listTasks({ clinicId: user?.clinicId, ...filters }),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
  });
}

export function useTask(id: string | null) {
  return useQuery({
    queryKey: TASK_KEYS.detail(id ?? ""),
    queryFn: () => getTask(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateStaffTaskDto, "clinicId">) =>
      createTask({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: ["staff-tasks"] });
    },
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus | string }) =>
      updateTaskStatus(id, status),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: ["staff-tasks"] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: ["staff-tasks"] });
    },
  });
}
