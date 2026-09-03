import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, getUnreadCount, markAsRead, markAllRead, deleteNotification } from "@/services/notifications.service";

const NOTIF_KEYS = {
  all: ["notifications"] as const,
  unread: ["notifications", "unread"] as const,
};

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: unreadOnly ? NOTIF_KEYS.unread : NOTIF_KEYS.all,
    queryFn: () => getNotifications(unreadOnly),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: NOTIF_KEYS.unread,
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: NOTIF_KEYS.all }); },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: NOTIF_KEYS.all }); },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: NOTIF_KEYS.all }); },
  });
}
