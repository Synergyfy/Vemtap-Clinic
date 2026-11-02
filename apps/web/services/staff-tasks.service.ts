import { api } from "@/lib/api";

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface StaffTaskStaff {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
}

export interface StaffTaskPatient {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}

export interface StaffTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignedToId: string | null;
  assignedTo?: StaffTaskStaff | null;
  assignedById: string | null;
  assignedBy?: StaffTaskStaff | null;
  patientId: string | null;
  patient?: StaffTaskPatient | null;
  clinicId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StaffTaskQueryParams {
  clinicId?: string;
  assignedToId?: string;
  status?: TaskStatus | string;
  priority?: TaskPriority | string;
}

export interface CreateStaffTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignedToId?: string;
  assignedById?: string;
  patientId?: string;
  clinicId: string;
}

export interface UpdateStaffTaskStatusDto {
  status: TaskStatus;
}

/**
 * GET /api/staff-tasks
 * List staff tasks with filters
 */
export async function listTasks(params?: StaffTaskQueryParams): Promise<StaffTask[]> {
  const { data } = await api.get("/staff-tasks", { params });
  return Array.isArray(data) ? data : data?.data || [];
}

/**
 * GET /api/staff-tasks/{id}
 * Get task by ID
 */
export async function getTask(id: string): Promise<StaffTask> {
  const { data } = await api.get(`/staff-tasks/${id}`);
  return data;
}

/**
 * POST /api/staff-tasks
 * Create staff task
 */
export async function createTask(dto: CreateStaffTaskDto): Promise<StaffTask> {
  const { data } = await api.post("/staff-tasks", dto);
  return data;
}

/**
 * PUT /api/staff-tasks/{id}/status
 * Update task status
 */
export async function updateTaskStatus(id: string, status: TaskStatus | string): Promise<StaffTask> {
  const { data } = await api.put(`/staff-tasks/${id}/status`, { status });
  return data;
}

/**
 * DELETE /api/staff-tasks/{id}
 * Delete task
 */
export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/staff-tasks/${id}`);
}

export const staffTasksService = {
  listTasks,
  getTask,
  createTask,
  updateTaskStatus,
  deleteTask,
};
