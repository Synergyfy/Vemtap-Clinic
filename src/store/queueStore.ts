import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type QueueStatus = 'Waiting' | 'In Progress' | 'Verifying' | 'Completed' | 'Called' | 'No Show';
export type QueueType = 'consultation' | 'eye-test' | 'optical' | 'lens-pickup' | 'pharmacy' | 'emergency';
export type Priority = 'Normal' | 'High' | 'Emergency';
export type PatientType = 'Private' | 'HMO';
export type DisplayMode = 'tv' | 'reception' | 'doctor-room' | 'optical' | 'pharmacy';

export interface QueueEntry {
  id: string;
  ticketNumber: string;
  patientName: string;
  queueType: QueueType;
  status: QueueStatus;
  waitTime: string;
  waitTimeMinutes: number;
  patientType: PatientType;
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

interface QueueState {
  entries: QueueEntry[];
  stations: Station[];
  rooms: RoomStatus[];
  activeDisplayMode: DisplayMode;
  selectedQueueType: QueueType | 'all';
  announcements: string[];

  addEntry: (entry: Omit<QueueEntry, 'id' | 'ticketNumber' | 'waitTime' | 'waitTimeMinutes' | 'checkInTime' | 'status'>) => void;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, data: Partial<QueueEntry>) => void;
  updateStatus: (id: string, status: QueueStatus) => void;
  updateStation: (id: string, station: string) => void;
  updateRoomStatus: (roomId: string, status: RoomStatus['status']) => void;
  callPatient: (id: string) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setSelectedQueueType: (type: QueueType | 'all') => void;
  addAnnouncement: (text: string) => void;
  removeAnnouncement: (index: number) => void;
  resetStore: () => void;
}

const initialEntries: QueueEntry[] = [
  { id: 'q-001', ticketNumber: 'V-024', patientName: 'Chidimma Okoro', queueType: 'consultation', status: 'Waiting', waitTime: '12 mins', waitTimeMinutes: 12, patientType: 'HMO', provider: 'Reliance Health', priority: 'Normal', station: 'Nursing', checkInTime: '9:30 AM' },
  { id: 'q-002', ticketNumber: 'V-025', patientName: 'Babatunde Lawal', queueType: 'consultation', status: 'In Progress', waitTime: '25 mins', waitTimeMinutes: 25, patientType: 'Private', provider: 'Self-Pay', priority: 'Emergency', station: 'Consultation', assignedDoctor: 'Dr. Sarah Jenkins', checkInTime: '9:15 AM' },
  { id: 'q-003', ticketNumber: 'V-026', patientName: 'Yuki Tanaka', queueType: 'consultation', status: 'Verifying', waitTime: '5 mins', waitTimeMinutes: 5, patientType: 'HMO', provider: 'Axa Mansard', priority: 'Normal', station: 'HMO Queue', checkInTime: '9:50 AM' },
  { id: 'q-004', ticketNumber: 'V-027', patientName: 'Sarah Mensah', queueType: 'optical', status: 'Waiting', waitTime: '40 mins', waitTimeMinutes: 40, patientType: 'Private', provider: 'Self-Pay', priority: 'High', station: 'Optical', checkInTime: '9:05 AM' },
  { id: 'q-005', ticketNumber: 'V-028', patientName: 'Emeka Obi', queueType: 'eye-test', status: 'Completed', waitTime: '1 hour', waitTimeMinutes: 60, patientType: 'HMO', provider: 'Hygeia', priority: 'Normal', station: 'Nursing', checkInTime: '8:30 AM' },
  { id: 'q-006', ticketNumber: 'V-029', patientName: 'Aisha Mohammed', queueType: 'pharmacy', status: 'Waiting', waitTime: '8 mins', waitTimeMinutes: 8, patientType: 'Private', provider: 'Self-Pay', priority: 'Normal', station: 'Pharmacy', checkInTime: '10:00 AM' },
  { id: 'q-007', ticketNumber: 'V-030', patientName: 'James Okafor', queueType: 'lens-pickup', status: 'Waiting', waitTime: '15 mins', waitTimeMinutes: 15, patientType: 'Private', provider: 'Self-Pay', priority: 'Normal', station: 'Optical Pickup', checkInTime: '9:45 AM' },
  { id: 'q-008', ticketNumber: 'E-001', patientName: 'Grace Williams', queueType: 'emergency', status: 'In Progress', waitTime: '3 mins', waitTimeMinutes: 3, patientType: 'Private', provider: 'Self-Pay', priority: 'Emergency', station: 'Emergency Room', assignedDoctor: 'Dr. Michael Chen', checkInTime: '10:05 AM' },
];

const initialStations: Station[] = [
  { id: 'station-1', name: 'Nursing Station', type: 'consultation', isActive: true },
  { id: 'station-2', name: 'Consultation Room 1', type: 'consultation', isActive: true, currentPatientId: 'q-002', doctorName: 'Dr. Sarah Jenkins' },
  { id: 'station-3', name: 'Consultation Room 2', type: 'consultation', isActive: true, doctorName: 'Dr. Michael Chen' },
  { id: 'station-4', name: 'Eye Test Room', type: 'eye-test', isActive: true },
  { id: 'station-5', name: 'Optical Desk', type: 'optical', isActive: true },
  { id: 'station-6', name: 'Optical Pickup', type: 'lens-pickup', isActive: true },
  { id: 'station-7', name: 'Pharmacy', type: 'pharmacy', isActive: true },
  { id: 'station-8', name: 'Emergency Room', type: 'emergency', isActive: true, currentPatientId: 'q-008' },
  { id: 'station-9', name: 'HMO Verification', type: 'consultation', isActive: true },
];

const initialRooms: RoomStatus[] = [
  { roomId: 'room-1', roomName: 'Consultation Room 1', doctorName: 'Dr. Sarah Jenkins', status: 'occupied', currentPatient: 'Babatunde Lawal', queueCount: 3 },
  { roomId: 'room-2', roomName: 'Consultation Room 2', doctorName: 'Dr. Michael Chen', status: 'available', queueCount: 4 },
  { roomId: 'room-3', roomName: 'Eye Test Room', doctorName: 'Opt. David Smith', status: 'available', queueCount: 2 },
  { roomId: 'room-4', roomName: 'Emergency Room', doctorName: 'Dr. Emily Adams', status: 'occupied', currentPatient: 'Grace Williams', queueCount: 0 },
  { roomId: 'room-5', roomName: 'Optical Fitting', doctorName: 'Opt. John Obi', status: 'break', queueCount: 5 },
];

const initialState = {
  entries: initialEntries,
  stations: initialStations,
  rooms: initialRooms,
  activeDisplayMode: 'tv' as DisplayMode,
  selectedQueueType: 'all' as QueueType | 'all',
  announcements: ['Welcome to Vemtap Eye Clinic', 'Emergency cases will be prioritized', 'Please have your HMO ID ready'],
};

export const useQueueStore = create<QueueState>()(
  persist(
    (set) => ({
      ...initialState,

      addEntry: (entryData) => set((state) => {
        const nextNum = state.entries.length + 1;
        const prefix = entryData.queueType === 'emergency' ? 'E' : 'V';
        const newEntry: QueueEntry = {
          ...entryData,
          status: 'Waiting',
          id: `q-${Date.now()}`,
          ticketNumber: `${prefix}-${String(nextNum).padStart(3, '0')}`,
          waitTime: '0 mins',
          waitTimeMinutes: 0,
          checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        return { entries: [...state.entries, newEntry] };
      }),

      removeEntry: (id) => set((state) => ({
        entries: state.entries.filter(e => e.id !== id),
      })),

      updateEntry: (id, data) => set((state) => ({
        entries: state.entries.map(e => e.id === id ? { ...e, ...data } : e),
      })),

      updateStatus: (id, status) => set((state) => ({
        entries: state.entries.map(e => e.id === id ? { ...e, status } : e),
      })),

      updateStation: (id, station) => set((state) => ({
        entries: state.entries.map(e => e.id === id ? { ...e, station } : e),
      })),

      callPatient: (id) => set((state) => ({
        entries: state.entries.map(e => e.id === id ? { ...e, status: 'Called' as QueueStatus } : e),
      })),

      updateRoomStatus: (roomId, status) => set((state) => ({
        rooms: state.rooms.map(r => r.roomId === roomId ? { ...r, status } : r),
      })),

      setDisplayMode: (mode) => set({ activeDisplayMode: mode }),

      setSelectedQueueType: (type) => set({ selectedQueueType: type }),

      addAnnouncement: (text) => set((state) => ({
        announcements: [...state.announcements, text],
      })),

      removeAnnouncement: (index) => set((state) => ({
        announcements: state.announcements.filter((_, i) => i !== index),
      })),

      resetStore: () => set(initialState),
    }),
    {
      name: 'vemtap-queue-storage',
    }
  )
);

export const getQueueTypeLabel = (type: QueueType): string => {
  const labels: Record<QueueType, string> = {
    'consultation': 'Consultation',
    'eye-test': 'Eye Test',
    'optical': 'Optical',
    'lens-pickup': 'Lens Pickup',
    'pharmacy': 'Pharmacy',
    'emergency': 'Emergency',
  };
  return labels[type];
};

export const getStatusColor = (status: QueueStatus): string => {
  const colors: Record<QueueStatus, string> = {
    'Waiting': 'bg-slate-100 text-slate-600',
    'In Progress': 'bg-sky-100 text-sky-700',
    'Verifying': 'bg-amber-100 text-amber-700',
    'Completed': 'bg-emerald-100 text-emerald-700',
    'Called': 'bg-violet-100 text-violet-700',
    'No Show': 'bg-rose-100 text-rose-700',
  };
  return colors[status];
};
