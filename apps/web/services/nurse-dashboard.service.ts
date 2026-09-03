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

export const nurseDashboardService = {
  async getObservationNotes(staffId: string, clinicId: string): Promise<ObservationNote[]> {
    const params = new URLSearchParams({ staffId, clinicId, limit: '50' });
    const response = await api.get(`/observation-notes?${params.toString()}`);
    const data = response.data as PaginatedNotesResponse;
    return data.data || [];
  },

  async getQueueEntries(clinicId: string): Promise<QueueEntry[]> {
    const params = new URLSearchParams({ clinicId, limit: '50' });
    const response = await api.get(`/queue?${params.toString()}`);
    const data = response.data as PaginatedQueueResponse;
    return data.data || [];
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
