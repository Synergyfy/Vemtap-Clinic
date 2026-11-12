import { api } from "@/lib/api";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  /** Normalized flag: the API stores `isRead`, older UI code reads `read`. */
  read: boolean;
  isRead?: boolean;
  userId?: string;
  patientId?: string;
  clinicId?: string;
  createdAt: string;
}

const normalizeNotification = (notification: any): Notification => ({
  ...notification,
  read: Boolean(notification?.isRead ?? notification?.read ?? false),
});

export async function getNotifications(unreadOnly = false): Promise<Notification[]> {
  const params: any = {};
  if (unreadOnly) params.unreadOnly = "true";
  const { data } = await api.get("/notifications", { params });
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return list.map(normalizeNotification);
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get("/notifications/unread-count");
  return typeof data === "number" ? data : (data?.count ?? 0);
}

export async function markAsRead(id: string): Promise<void> {
  await api.put(`/notifications/${id}/read`);
}

export async function markAllRead(): Promise<void> {
  await api.put("/notifications/read-all");
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}
