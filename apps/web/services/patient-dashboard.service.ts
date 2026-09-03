import { api } from '@/lib/api';

export interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime?: string;
  status: string;
  reason?: string;
  type: string;
  patientId: string;
  patient?: { id: string; firstName: string; lastName: string };
  staff?: { id: string; firstName: string; lastName: string };
  clinicId: string;
  createdAt: string;
}

export interface LensOrder {
  id: string;
  lensType: string;
  frameDescription?: string;
  totalPrice: number;
  status: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  patientId: string;
  clinicId: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function getStaffName(staff: { firstName: string; lastName: string } | undefined): string {
  if (!staff) return "Unknown Doctor";
  return `Dr. ${staff.firstName} ${staff.lastName}`;
}

function getPatientName(patient: { firstName: string; lastName: string } | undefined): string {
  if (!patient) return "Unknown Patient";
  return `${patient.firstName} ${patient.lastName}`;
}

export const patientDashboardService = {
  async getAppointments(patientId: string, clinicId: string): Promise<Appointment[]> {
    const params = new URLSearchParams({ patientId, clinicId, limit: '10' });
    const response = await api.get(`/appointments?${params.toString()}`);
    const data = response.data as PaginatedResponse<Appointment>;
    return data.data || [];
  },

  async getLensOrders(patientId: string, clinicId: string): Promise<LensOrder[]> {
    const params = new URLSearchParams({ clinicId, limit: '10' });
    const response = await api.get(`/optical/lens-orders?${params.toString()}`);
    const data = response.data as PaginatedResponse<LensOrder>;
    const allOrders = data.data || [];
    return allOrders.filter((o) => o.patientId === patientId);
  },
};
