import { api } from '@/lib/api';

export interface ObservationNote {
  id: string;
  note: string;
  category: string;
  patientId: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  staffId?: string;
  clinicId: string;
  createdAt: string;
}

export interface PaginatedNotesResponse {
  data: ObservationNote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueueEntry {
  id: string;
  ticketNumber: number;
  status: string;
  station?: string;
  priority?: string;
  notes?: string;
  patientId: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  clinicId: string;
  createdAt: string;
}

export interface PaginatedQueueResponse {
  data: QueueEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime?: string;
  status: string;
  reason?: string;
  type: string;
  patientId: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  staffId?: string;
  clinicId: string;
  createdAt: string;
}

export interface PaginatedAppointmentsResponse {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function getPatientName(patient: { firstName: string; lastName: string } | undefined): string {
  if (!patient) return "Unknown Patient";
  return `${patient.firstName} ${patient.lastName}`;
}

const dedupeById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export const nurseDashboardService = {
  async getObservationNotes(staffId: string, clinicId: string): Promise<ObservationNote[]> {
    const assignedAppointments = await this.getAssignedAppointments(staffId, clinicId);
    const patientIds = [...new Set(assignedAppointments.map((appointment) => appointment.patientId))];

    if (patientIds.length === 0) return [];

    const responses = await Promise.all(
      patientIds.map((patientId) => api.get(`/observation-notes?patientId=${encodeURIComponent(patientId)}&limit=50`)),
    );

    const notes = responses.flatMap((response) => {
      const data = response.data as PaginatedNotesResponse;
      return data.data || [];
    });

    return dedupeById(notes).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getQueueEntries(staffId: string, clinicId: string): Promise<QueueEntry[]> {
    const assignedAppointments = await this.getAssignedAppointments(staffId, clinicId);
    const patientIds = [...new Set(assignedAppointments.map((appointment) => appointment.patientId))];

    if (patientIds.length === 0) return [];

    const responses = await Promise.all(
      patientIds.map((patientId) => api.get(`/queue?patientId=${encodeURIComponent(patientId)}&limit=50`)),
    );

    const queueEntries = responses.flatMap((response) => {
      const data = response.data as PaginatedQueueResponse;
      return data.data || [];
    });

    return dedupeById(queueEntries).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAssignedAppointments(staffId: string, clinicId: string): Promise<Appointment[]> {
    const today = new Intl.DateTimeFormat('en-CA').format(new Date());
    const params = new URLSearchParams({
      staffId,
      clinicId,
      startDate: today,
      endDate: today,
      limit: '50',
    });
    const response = await api.get(`/appointments?${params.toString()}`);
    const data = response.data as PaginatedAppointmentsResponse;
    return data.data || [];
  },

  async getFollowUps(staffId: string, clinicId: string): Promise<Appointment[]> {
    const params = new URLSearchParams({
      staffId,
      clinicId,
      type: 'follow_up',
      limit: '20',
    });
    const response = await api.get(`/appointments?${params.toString()}`);
    const data = response.data as PaginatedAppointmentsResponse;
    return data.data || [];
  },
};
