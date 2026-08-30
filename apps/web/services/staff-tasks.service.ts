import { api } from "@/lib/api";

export interface StaffTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignedTo: string | null;
  assignedBy: string | null;
  dueDate: string | null;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export async function listTasks(params?: { clinicId?: string; status?: string; assignedTo?: string }): Promise<StaffTask[]> {
  const { data } = await api.get("/staff-tasks", { params });
  return data;
}

export async function getTask(id: string): Promise<StaffTask> {
  const { data } = await api.get(`/staff-tasks/${id}`);
  return data;
}

export async function createTask(dto: { title: string; description?: string; priority?: string; assignedTo?: string; dueDate?: string; clinicId: string }): Promise<StaffTask> {
  const { data } = await api.post("/staff-tasks", dto);
  return data;
}

export async function updateTaskStatus(id: string, status: string): Promise<StaffTask> {
  const { data } = await api.put(`/staff-tasks/${id}/status`, { status });
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/staff-tasks/${id}`);
}
