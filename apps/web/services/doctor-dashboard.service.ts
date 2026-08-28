import { api } from '@/lib/api';
import { Appointment, PaginatedAppointmentsResponse, AppointmentQueryParams } from '@/services/appointments.service';

export interface DoctorDashboardStats {
  patientsToday: number;
  avgConsultationTime: string;
  pendingFollowUps: number;
  completedToday: number;
}

export interface MedicalRecord {
  id: string;
  chiefComplaint?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  patientId: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  staffId?: string;
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRecordsResponse {
  data: MedicalRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RecordQueryParams {
  clinicId?: string;
  patientId?: string;
  staffId?: string;
  branchId?: string;
  page?: number;
  limit?: number;
}

export interface FollowUp {
  id: string;
  patientName: string;
  dueISO: string;
  reason: string;
  status: string;
}

export const doctorDashboardService = {
  async getTodayAppointments(staffId: string, clinicId: string): Promise<Appointment[]> {
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

  async getConsultationQueue(clinicId: string): Promise<any[]> {
    const params = new URLSearchParams({
      clinicId,
      status: 'waiting',
      limit: '20',
    });
    const response = await api.get(`/queue?${params.toString()}`);
    const data = response.data as { data: any[] };
    return data.data || [];
  },

  async getRecentRecords(staffId: string, clinicId: string, limit = 5): Promise<MedicalRecord[]> {
    const params = new URLSearchParams({
      staffId,
      clinicId,
      limit: String(limit),
    });
    const response = await api.get(`/records?${params.toString()}`);
    const data = response.data as PaginatedRecordsResponse;
    return data.data || [];
  },

  async getFollowUps(staffId: string, clinicId: string): Promise<FollowUp[]> {
    const params = new URLSearchParams({
      staffId,
      clinicId,
      type: 'follow_up',
      status: 'scheduled',
      limit: '10',
    });
    const response = await api.get(`/appointments?${params.toString()}`);
    const data = response.data as PaginatedAppointmentsResponse;
    return (data.data || []).map((a) => ({
      id: a.id,
      patientName: a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : 'Unknown',
      dueISO: a.appointmentDate,
      reason: a.reason || 'Follow-up visit',
      status: a.status,
    }));
  },
};
