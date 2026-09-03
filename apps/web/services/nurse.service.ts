import { api } from '@/lib/api';

// ── Types ──
export interface QueueEntry {
  id: string;
  ticketNumber: number;
  status: string;
  station: string;
  priority: string;
  notes: string;
  calledAt: string;
  completedAt: string;
  patientId: string;
  patient?: { firstName: string; lastName: string; dateOfBirth: string; gender: string; };
  branchId: string;
  clinicId: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patient?: { firstName: string; lastName: string; };
  staffId: string;
  staff?: { firstName: string; lastName: string; };
  branchId: string;
  clinicId: string;
  chiefComplaint: string;
  diagnosis: string;
  notes: string;
  vitals?: Vitals;
  createdAt: string;
}

export interface Vitals {
  id: string;
  temperature: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  respiratoryRate: number;
  weight: number;
  height: number;
  oxygenSaturation: number;
  bloodGroup: string;
  medicalRecordId: string;
  createdAt: string;
}

export interface ObservationNote {
  id: string;
  note: string;
  category: string;
  patientId: string;
  patient?: { firstName: string; lastName: string; };
  staffId: string;
  staff?: { firstName: string; lastName: string; };
  clinicId: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patient?: { firstName: string; lastName: string; };
  staffId: string;
  staff?: { firstName: string; lastName: string; };
  type: string;
  status: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  notes: string;
  clinicId: string;
}

// ── Queue ──
export const nurseQueueService = {
  getEntries: async (clinicId: string): Promise<QueueEntry[]> => {
    const res = await api.get(`/queue?clinicId=${clinicId}&limit=100`);
    return res.data;
  },
  complete: async (entryId: string): Promise<void> => {
    await api.put(`/queue/${entryId}/complete`);
  },
};

// ── Medical Records (Vitals) ──
export const nurseRecordsService = {
  getPatientHistory: async (patientId: string): Promise<MedicalRecord[]> => {
    const res = await api.get(`/records/patient/${patientId}`);
    return res.data;
  },
  create: async (data: {
    patientId: string;
    staffId?: string;
    branchId: string;
    clinicId: string;
    chiefComplaint?: string;
    vitals?: Partial<Vitals>;
  }): Promise<MedicalRecord> => {
    const res = await api.post('/records', data);
    return res.data;
  },
};

// ── Observation Notes ──
export const nurseNotesService = {
  getByPatient: async (patientId: string): Promise<ObservationNote[]> => {
    const res = await api.get(`/observation-notes?patientId=${patientId}`);
    return res.data;
  },
  getByClinic: async (clinicId: string): Promise<ObservationNote[]> => {
    const res = await api.get(`/observation-notes?clinicId=${clinicId}`);
    return res.data;
  },
  create: async (data: {
    patientId: string;
    note: string;
    category: string;
    clinicId: string;
  }): Promise<ObservationNote> => {
    const res = await api.post('/observation-notes', data);
    return res.data;
  },
};

// ── Appointments (Follow-ups) ──
export const nurseAppointmentsService = {
  getByStaff: async (staffId: string, clinicId: string, startDate?: string, endDate?: string): Promise<Appointment[]> => {
    const params = new URLSearchParams({ staffId, clinicId, limit: '100' });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const res = await api.get(`/appointments?${params.toString()}`);
    return res.data;
  },
  getFollowUps: async (staffId: string, clinicId: string): Promise<Appointment[]> => {
    const params = new URLSearchParams({ staffId, clinicId, type: 'follow_up', limit: '100' });
    const res = await api.get(`/appointments?${params.toString()}`);
    return res.data;
  },
};
