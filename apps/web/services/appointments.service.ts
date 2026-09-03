import { api } from '@/lib/api';

export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type AppointmentType = 
  | 'consultation'
  | 'follow_up'
  | 'emergency'
  | 'eye_test'
  | 'surgery';

export interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime?: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  type: AppointmentType;
  patientId: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    patientType: string;
    hmoName?: string;
  };
  staffId?: string;
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  branchId: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAppointmentsResponse {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppointmentQueryParams {
  clinicId?: string;
  branchId?: string;
  patientId?: string;
  staffId?: string;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CalendarViewParams {
  clinicId: string;
  startDate: string;
  endDate: string;
}

export interface CreateAppointmentData {
  appointmentDate: string;
  appointmentTime?: string;
  type?: AppointmentType;
  reason?: string;
  notes?: string;
  patientId: string;
  staffId?: string;
  branchId: string;
  clinicId: string;
}

export interface UpdateAppointmentData {
  appointmentDate?: string;
  appointmentTime?: string;
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
  staffId?: string;
  type?: AppointmentType;
}

export interface AvailableSlotsResponse {
  staffId: string;
  date: string;
  slots: string[];
}

export interface TodayAppointmentsResponse {
  appointments: Appointment[];
  total: number;
  arrived: number;
  pending: number;
  priority: number;
}

export interface AppointmentStats {
  total: number;
  scheduled: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export const appointmentsService = {
  async getAll(params: AppointmentQueryParams = {}): Promise<PaginatedAppointmentsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const response = await api.get(`/appointments?${searchParams.toString()}`);
    return response.data as PaginatedAppointmentsResponse;
  },

  async getById(id: string): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`);
    return response.data as Appointment;
  },

  async create(data: CreateAppointmentData): Promise<Appointment> {
    const response = await api.post('/appointments', data);
    return response.data as Appointment;
  },

  async update(id: string, data: UpdateAppointmentData): Promise<Appointment> {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data as Appointment;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },

  async getCalendarView(params: CalendarViewParams): Promise<Appointment[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const response = await api.get(`/appointments/calendar?${searchParams.toString()}`);
    return response.data as Appointment[];
  },

  async getToday(clinicId: string): Promise<TodayAppointmentsResponse> {
    const response = await api.get(`/appointments/today?clinicId=${clinicId}`);
    return response.data as TodayAppointmentsResponse;
  },

  async getAvailableSlots(staffId: string, date: string): Promise<AvailableSlotsResponse> {
    const response = await api.get(`/appointments/available-slots?staffId=${staffId}&date=${date}`);
    return response.data as AvailableSlotsResponse;
  },

  async getStats(clinicId: string): Promise<AppointmentStats> {
    const response = await api.get(`/appointments/stats?clinicId=${clinicId}`);
    return response.data as AppointmentStats;
  },
};