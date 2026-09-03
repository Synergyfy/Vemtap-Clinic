"use client";

import { useEffect, useCallback, useState } from "react";
import { useSocket } from "./useSocket";
import { useAuth } from "@/lib/auth-context";

export interface QueueUpdate {
  id: string;
  ticketNumber: string;
  status: string;
  priority: string;
  serviceType: string;
  patientId: string;
  patient?: { firstName: string; lastName: string };
  calledAt?: string;
  completedAt?: string;
}

export function useQueueSocket() {
  const { user } = useAuth();
  const { socket, isConnected, on, emit } = useSocket("queue");
  const [updates, setUpdates] = useState<QueueUpdate[]>([]);

  useEffect(() => {
    if (!user?.clinicId || !isConnected) return;

    emit("joinQueue", { clinicId: user.clinicId });

    const cleanupNew = on("queue:new", (entry: QueueUpdate) => {
      setUpdates(prev => [entry, ...prev]);
    });

    const cleanupUpdate = on("queue:update", (entry: QueueUpdate) => {
      setUpdates(prev => prev.map(u => u.id === entry.id ? { ...u, ...entry } : u));
    });

    return () => {
      cleanupNew();
      cleanupUpdate();
    };
  }, [user?.clinicId, isConnected, on, emit]);

  return { isConnected, updates, setUpdates };
}

export function useQueueCallSocket(onCall?: (entry: QueueUpdate) => void) {
  const { user } = useAuth();
  const { isConnected, on } = useSocket("queue");

  useEffect(() => {
    if (!user?.clinicId || !isConnected || !onCall) return;

    const cleanup = on("queue:call", (entry: QueueUpdate) => {
      onCall(entry);
    });

    return cleanup;
  }, [user?.clinicId, isConnected, on, onCall]);

  return { isConnected };
}
