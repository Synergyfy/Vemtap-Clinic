import { api } from "@/lib/api";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  userId: string;
  clinicId: string;
  createdAt: string;
}

export async function getNotifications(unreadOnly = false): Promise<Notification[]> {
  const params: any = {};
  if (unreadOnly) params.unreadOnly = "true";
  const { data } = await api.get("/notifications", { params });
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get("/notifications/unread-count");
  return data.count ?? data;
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
