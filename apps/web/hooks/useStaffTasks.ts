import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { listTasks, createTask, updateTaskStatus, deleteTask, type StaffTask } from "@/services/staff-tasks.service";

const TASK_KEYS = {
  all: (clinicId: string) => ["staff-tasks", clinicId] as const,
};

export function useTasks(filters?: { status?: string; assignedTo?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...TASK_KEYS.all(user?.clinicId ?? ""), filters],
    queryFn: () => listTasks({ clinicId: user?.clinicId, ...filters }),
    enabled: !!user?.clinicId,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { title: string; description?: string; priority?: string; assignedTo?: string; dueDate?: string }) =>
      createTask({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: TASK_KEYS.all(user.clinicId) }); },
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateTaskStatus(id, status),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: TASK_KEYS.all(user.clinicId) }); },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: TASK_KEYS.all(user.clinicId) }); },
  });
}
