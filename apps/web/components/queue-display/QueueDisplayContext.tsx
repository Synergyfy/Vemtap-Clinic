"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useQueue, useQueueSocket } from "@/hooks/useQueueSocket";
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
  const { data: apiEntries = [], isLoading } = useQueueAPI();
  const { isConnected, updates } = useQueueSocket();
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
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
      setEntries(apiEntries);
    }
  }, [apiEntries]);

  // Handle real-time updates
  useEffect(() => {
    if (!updates.length) return;
    
    for (const update of updates) {
      setEntries(prev => {
        const existing = prev.findIndex(e => e.id === update.id);
        if (existing >= 0) {
          const newEntries = [...prev];
          newEntries[existing] = { ...newEntries[existing], ...update };
          return newEntries;
        } else {
          return [update, ...prev];
        }
      });
    }
  }, [updates]);

  // Initialize rooms from entries (derive from data)
  useEffect(() => {
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
    
    setRooms(Array.from(roomMap.values()));
  }, [entries]);

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