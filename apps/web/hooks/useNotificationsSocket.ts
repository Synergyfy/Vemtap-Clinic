"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./useSocket";
import { useAuth } from "@/lib/auth-context";
import { getActivePatientProfileId, subscribeToActivePatientProfile } from "@/lib/api";

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

/**
 * Live notification delivery over the `/notifications` socket.
 *
 * Staff subscribe to their own user room. Patient sessions subscribe to the
 * family profile currently selected (X-Patient-Id equivalent), so a guardian
 * viewing a dependent receives that dependent's notifications.
 */
export function useNotificationsSocket() {
  const { user } = useAuth();
  const { socket, isConnected, on, emit } = useSocket("notifications");
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latest, setLatest] = useState<RealtimeNotification | null>(null);

  const isPatient = Array.isArray(user?.roles) && user.roles.includes("patient");

  const activeProfileId = useSyncExternalStore(
    subscribeToActivePatientProfile,
    () => getActivePatientProfileId() ?? "primary",
    () => "primary",
  );

  const refreshNotificationQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["patient-portal", "notifications"] });
  }, [queryClient]);

  useEffect(() => {
    if (!isConnected) return;

    const cleanupNew = on("notification:new", (notification: RealtimeNotification) => {
      setLatest(notification);
      setUnreadCount((count) => count + 1);
      refreshNotificationQueries();
    });

    const cleanupCount = on("notification:unread-count", (data: { count: number }) => {
      setUnreadCount(data.count);
      refreshNotificationQueries();
    });

    return () => {
      cleanupNew();
      cleanupCount();
    };
  }, [isConnected, on, refreshNotificationQueries]);

  useEffect(() => {
    if (!isConnected || !user) return;

    if (isPatient) {
      // Re-subscribe whenever the selected family profile changes so realtime
      // events follow the profile on screen.
      if (activeProfileId && activeProfileId !== "primary") {
        emit("joinPatientProfile", { patientId: activeProfileId });
      } else if (user.userId) {
        emit("joinPatientProfile", { patientId: user.userId });
      }
      return;
    }

    if (user.clinicId) {
      emit("joinNotifications", { clinicId: user.clinicId });
    }
    emit("joinUserNotifications");
  }, [activeProfileId, emit, isConnected, isPatient, user]);

  return { isConnected, unreadCount, setUnreadCount, latest, refreshNotificationQueries, socket };
}
