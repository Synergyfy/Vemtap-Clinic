import { api } from '@/lib/api';

// ── Medical Records ──
export interface MedicalRecord {
  id: string;
  patientId: string;
  patient?: { firstName: string; lastName: string; dateOfBirth: string; gender: string; phone: string; };
  staffId: string;
  staff?: { firstName: string; lastName: string; };
  branchId: string;
  clinicId: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  diagnosis: string;
  treatmentPlan: string;
  notes: string;
  vitals?: {
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
  };
  eyeTests?: any[];
  prescriptions?: Prescription[];
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  isActive: boolean;
  medicalRecordId: string;
  prescribedById: string;
  prescribedBy?: { firstName: string; lastName: string; };
  createdAt: string;
}

export interface CreateRecordData {
  patientId: string;
  staffId?: string;
  branchId: string;
  clinicId: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  pastMedicalHistory?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  vitals?: Partial<MedicalRecord['vitals']>;
}

export interface CreatePrescriptionData {
  medicalRecordId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  prescribedById?: string;
}

// ── Records Service ──
export const recordsService = {
  getAll: async (params?: { clinicId?: string; staffId?: string; patientId?: string; limit?: number }): Promise<MedicalRecord[]> => {
    const searchParams = new URLSearchParams();
    if (params?.clinicId) searchParams.set('clinicId', params.clinicId);
    if (params?.staffId) searchParams.set('staffId', params.staffId);
    if (params?.patientId) searchParams.set('patientId', params.patientId);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const res = await api.get(`/records?${searchParams.toString()}`);
    return res.data;
  },
  getById: async (id: string): Promise<MedicalRecord> => {
    const res = await api.get(`/records/${id}`);
    return res.data;
  },
  getPatientHistory: async (patientId: string): Promise<MedicalRecord[]> => {
    const res = await api.get(`/records/patient/${patientId}`);
    return res.data;
  },
  create: async (data: CreateRecordData): Promise<MedicalRecord> => {
    const res = await api.post('/records', data);
    return res.data;
  },
  update: async (id: string, data: Partial<CreateRecordData>): Promise<MedicalRecord> => {
    const res = await api.put(`/records/${id}`, data);
    return res.data;
  },
};

// ── Prescriptions Service ──
export const prescriptionsService = {
  getByRecord: async (medicalRecordId: string): Promise<Prescription[]> => {
    const res = await api.get(`/prescriptions?medicalRecordId=${medicalRecordId}`);
    return res.data;
  },
  getByPatient: async (patientId: string): Promise<Prescription[]> => {
    const res = await api.get(`/prescriptions/patient/${patientId}`);
    return res.data;
  },
  create: async (data: CreatePrescriptionData): Promise<Prescription> => {
    const res = await api.post('/prescriptions', data);
    return res.data;
  },
};
