"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useQueueSocket } from "@/hooks/useQueueSocket";
import { useQueue as useQueueAPI } from "@/hooks/useQueue";

export type QueueType = 'consultation' | 'eye-test' | 'optical' | 'lens-pickup' | 'pharmacy' | 'emergency';
export type Priority = 'Normal' | 'High' | 'Emergency';
export type QueueStatus = 'Waiting' | 'In Progress' | 'Verifying' | 'Completed' | 'Called' | 'No Show';
export type DisplayMode = 'tv' | 'reception' | 'doctor-room' | 'optical' | 'pharmacy';

export interface QueueEntry {
  id: string;
  ticketNumber: string;
  patientName: string;
  queueType: QueueType;
  status: QueueStatus;
  waitTime: string;
  waitTimeMinutes: number;
  patientType: 'Private' | 'HMO';
  provider: string;
  priority: Priority;
  station: string;
  assignedDoctor?: string;
  checkInTime: string;
  reason?: string;
  notes?: string;
}

export interface Station {
  id: string;
  name: string;
  type: QueueType;
  isActive: boolean;
  currentPatientId?: string;
  doctorName?: string;
}

export interface RoomStatus {
  roomId: string;
  roomName: string;
  doctorName: string;
  status: 'available' | 'occupied' | 'break' | 'offline';
  currentPatient?: string;
  queueCount: number;
}

export interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  createdAt: string;
}

export const queueTypes: { type: QueueType | 'all'; label: string }[] = [
  { type: 'all', label: 'All Queues' },
  { type: 'consultation', label: 'Consultation' },
  { type: 'eye-test', label: 'Eye Test' },
  { type: 'optical', label: 'Optical' },
  { type: 'lens-pickup', label: 'Lens Pickup' },
  { type: 'pharmacy', label: 'Pharmacy' },
  { type: 'emergency', label: 'Emergency' },
];

export function getQueueTypeLabel(type: QueueType): string {
  const found = queueTypes.find(q => q.type === type);
  return found?.label || type;
}

interface QueueDisplayContextValue {
  entries: QueueEntry[];
  rooms: RoomStatus[];
  announcements: Announcement[];
  selectedQueueType: QueueType | 'all';
  setSelectedQueueType: (type: QueueType | 'all') => void;
  activeDisplayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  isConnected: boolean;
}

const QueueDisplayContext = createContext<QueueDisplayContextValue | null>(null);

export function QueueDisplayProvider({ children }: { children: React.ReactNode }) {
  const { data: apiQueueResponse } = useQueueAPI();
  const apiEntries = apiQueueResponse?.data ?? [];
  const { isConnected, updates } = useQueueSocket();
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const rooms = useMemo(() => {
    const roomMap = new Map<string, RoomStatus>();

    entries.forEach(entry => {
      if (!roomMap.has(entry.station)) {
        roomMap.set(entry.station, {
          roomId: entry.station,
          roomName: entry.station,
          doctorName: entry.assignedDoctor || entry.provider || "Unassigned",
          status: entry.status === "In Progress" ? "occupied" : "available",
          currentPatient: entry.patientName,
          queueCount: 0,
        });
      }

      const room = roomMap.get(entry.station)!;
      if (entry.status === "Waiting" || entry.status === "Verifying") {
        room.queueCount++;
      }
      if (entry.status === "In Progress") {
        room.status = "occupied";
        room.currentPatient = entry.patientName;
      }
    });

    return Array.from(roomMap.values());
  }, [entries]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: "A-001", message: "Clinic opens at 8:00 AM tomorrow", type: "info", createdAt: new Date().toISOString() },
    { id: "A-002", message: "Flu shots available at Branch 2", type: "success", createdAt: new Date().toISOString() },
    { id: "A-003", message: "System maintenance tonight 10 PM - 12 AM", type: "warning", createdAt: new Date().toISOString() },
  ]);
  const [selectedQueueType, setSelectedQueueType] = useState<QueueType | 'all'>('all');
  const [activeDisplayMode, setDisplayMode] = useState<DisplayMode>('reception');

  // Initialize from API
  useEffect(() => {
    if (apiEntries.length > 0) {
      const converted: QueueEntry[] = apiEntries.map((e: any) => ({
        id: e.id,
        ticketNumber: e.ticketNumber,
        patientName: e.patientName || `${e.patient?.firstName || ''} ${e.patient?.lastName || ''}`.trim() || 'Unknown',
        queueType: e.queueType || e.stage || 'consultation',
        status: e.status,
        waitTime: e.waitTime || '',
        waitTimeMinutes: e.waitTimeMinutes || 0,
        patientType: e.patientType || 'Private',
        provider: e.provider || e.hmo?.name || 'Self-Pay',
        priority: e.priority || 'Normal',
        station: e.station || e.stage || '',
        assignedDoctor: e.assignedDoctor,
        checkInTime: e.checkInTime || e.createdAt || new Date().toISOString(),
        reason: e.reason,
        notes: e.notes,
      }));
      setEntries(converted);
    }
  }, [apiEntries]);

  // Handle real-time updates
  useEffect(() => {
    if (!updates.length) return;
    
    for (const update of updates) {
      setEntries(prev => {
        const existing = prev.findIndex(e => e.id === update.id);
        const queueEntry: QueueEntry = {
          id: update.id,
          ticketNumber: update.ticketNumber,
          patientName: update.patient?.firstName || update.patient?.lastName 
            ? `${update.patient?.firstName || ''} ${update.patient?.lastName || ''}`.trim() 
            : 'Unknown',
          queueType: (update.serviceType as QueueType) || 'consultation',
          status: update.status as QueueStatus,
          waitTime: '',
          waitTimeMinutes: 0,
          patientType: 'Private',
          provider: update.patient?.firstName ? `${update.patient.firstName} ${update.patient.lastName}` : 'Unknown',
          priority: update.priority as Priority,
          station: update.serviceType,
          assignedDoctor: undefined,
          checkInTime: update.calledAt || new Date().toISOString(),
          reason: undefined,
          notes: undefined,
        };
        
        if (existing >= 0) {
          const newEntries = [...prev];
          newEntries[existing] = { ...newEntries[existing], ...queueEntry };
          return newEntries;
        } else {
          return [queueEntry, ...prev];
        }
      });
    }
  }, [updates]);

  return (
    <QueueDisplayContext.Provider value={{
      entries,
      rooms,
      announcements,
      selectedQueueType,
      setSelectedQueueType,
      activeDisplayMode,
      setDisplayMode,
      isConnected,
    }}>
      {children}
    </QueueDisplayContext.Provider>
  );
}

export function useQueueDisplay() {
  const context = useContext(QueueDisplayContext);
  if (!context) {
    throw new Error("useQueueDisplay must be used within QueueDisplayProvider");
  }
  return context;
}