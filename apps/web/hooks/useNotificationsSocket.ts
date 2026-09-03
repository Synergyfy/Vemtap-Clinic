"use client";

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";
import { useAuth } from "@/lib/auth-context";

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function useNotificationsSocket() {
  const { user } = useAuth();
  const { socket, isConnected, on, emit } = useSocket("notifications");
  const [unreadCount, setUnreadCount] = useState(0);
  const [latest, setLatest] = useState<RealtimeNotification | null>(null);

  useEffect(() => {
    if (!user?.clinicId || !isConnected) return;

    emit("joinNotifications", { clinicId: user.clinicId });
    emit("joinUserNotifications");

    const cleanupNew = on("notification:new", (notification: RealtimeNotification) => {
      setLatest(notification);
      setUnreadCount(prev => prev + 1);
    });

    const cleanupCount = on("notification:unread-count", (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    return () => {
      cleanupNew();
      cleanupCount();
    };
  }, [user?.clinicId, isConnected, on, emit]);

  return { isConnected, unreadCount, setUnreadCount, latest };
}
