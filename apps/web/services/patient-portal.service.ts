import { api } from '@/lib/api';

export interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  clinicId: string;
  createdAt: string;
}

export interface PatientAppointment {
  id: string;
  appointmentDate: string;
  appointmentTime?: string;
  type: string;
  reason?: string;
  status: string;
  staff?: { id: string; firstName: string; lastName: string };
  patient?: { id: string; firstName: string; lastName: string };
  clinicId: string;
  branchId?: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  visitDate: string;
  diagnosis?: string;
  symptoms?: string;
  notes?: string;
  treatment?: string;
  recordType: string;
  staff?: { id: string; firstName: string; lastName: string };
  patient?: { id: string; firstName: string; lastName: string };
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    respiratoryRate?: number;
  };
  prescriptions?: Prescription[];
  createdAt: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  isActive: boolean;
  prescribedBy?: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: string;
  items?: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  channel: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface OpticalItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  sellingPrice: number;
  quantity: number;
  brand?: string;
  material?: string;
  color?: string;
  clinicId: string;
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

export const patientPortalService = {
  async getProfile(): Promise<PatientProfile> {
    const response = await api.get('/patient-portal/profile');
    return response.data;
  },

  async updateProfile(dto: { phone?: string; address?: string; city?: string; state?: string; emergencyContact?: string; emergencyPhone?: string }): Promise<PatientProfile> {
    const response = await api.put('/patient-portal/profile', dto);
    return response.data;
  },

  async getAppointments(): Promise<PatientAppointment[]> {
    const response = await api.get('/patient-portal/appointments');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  async bookAppointment(dto: {
    appointmentDate: string;
    appointmentTime?: string;
    type: string;
    reason?: string;
    branchId: string;
  }): Promise<PatientAppointment> {
    const response = await api.post('/patient-portal/appointments', dto);
    return response.data;
  },

  async rescheduleAppointment(id: string, dto: {
    appointmentDate: string;
    appointmentTime?: string;
  }): Promise<PatientAppointment> {
    const response = await api.put(`/appointments/${id}`, dto);
    return response.data;
  },

  async cancelAppointment(id: string): Promise<void> {
    await api.put(`/appointments/${id}`, { status: 'cancelled' });
  },

  async getRecords(): Promise<MedicalRecord[]> {
    const response = await api.get('/patient-portal/records');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  async getBilling(): Promise<Invoice[]> {
    const response = await api.get('/patient-portal/billing');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  async makePayment(invoiceId: string, dto: { amount: number; paymentMethod: string; reference?: string }): Promise<void> {
    await api.post('/billing/payments', { ...dto, invoiceId });
  },

  async getNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data?.count ?? 0;
  },

  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.put('/notifications/read-all');
  },

  async getOpticalItems(): Promise<OpticalItem[]> {
    const response = await api.get('/optical/items');
    const data = response.data as PaginatedResponse<OpticalItem>;
    return data.data || [];
  },

  async getLensOrders(): Promise<LensOrder[]> {
    const response = await api.get('/optical/lens-orders');
    const data = response.data as PaginatedResponse<LensOrder>;
    return data.data || [];
  },
};
