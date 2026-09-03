import { api } from '@/lib/api';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  nationality?: string;
  occupation?: string;
  patientType: 'private' | 'hmo';
  hmoId?: string;
  hmoName?: string;
  hmoNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodGroup?: string;
  genotype?: string;
  allergies?: string;
  status: 'new' | 'active' | 'inactive';
  clinicId: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPatientsResponse {
  data: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PatientQueryParams {
  search?: string;
  patientType?: 'private' | 'hmo';
  status?: 'new' | 'active' | 'inactive';
  branchId?: string;
  clinicId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreatePatientData {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  nationality?: string;
  occupation?: string;
  patientType?: 'private' | 'hmo';
  hmoId?: string;
  hmoName?: string;
  hmoNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodGroup?: string;
  genotype?: string;
  allergies?: string;
  clinicId: string;
  branchId: string;
}

export interface UpdatePatientData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  nationality?: string;
  occupation?: string;
  patientType?: 'private' | 'hmo';
  hmoId?: string;
  hmoName?: string;
  hmoNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodGroup?: string;
  genotype?: string;
  allergies?: string;
  status?: 'new' | 'active' | 'inactive';
  branchId?: string;
}

export interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  new: number;
  private: number;
  hmo: number;
}

export interface HMOEligibilityResponse {
  eligible: boolean;
  coveragePercent: number;
  maxAmount: number;
  remainingBalance: number;
  requiresPreAuth: boolean;
}

export const patientsService = {
  async getAll(params: PatientQueryParams = {}): Promise<PaginatedPatientsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const response = await api.get(`/patients?${searchParams.toString()}`);
    return response.data as PaginatedPatientsResponse;
  },

  async getById(id: string): Promise<Patient> {
    const response = await api.get(`/patients/${id}`);
    return response.data as Patient;
  },

  async create(data: CreatePatientData): Promise<Patient> {
    const response = await api.post('/patients', data);
    return response.data as Patient;
  },

  async update(id: string, data: UpdatePatientData): Promise<Patient> {
    const response = await api.put(`/patients/${id}`, data);
    return response.data as Patient;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/patients/${id}`);
  },

  async getStats(clinicId: string): Promise<PatientStats> {
    const response = await api.get(`/patients/stats?clinicId=${clinicId}`);
    return response.data as PatientStats;
  },

  async getByHMO(hmoName: string, clinicId: string): Promise<Patient[]> {
    const response = await api.get(`/patients/hmo/${hmoName}?clinicId=${clinicId}`);
    return response.data as Patient[];
  },

  async checkHMOEligibility(
    patientId: string,
    serviceType: string,
    serviceAmount: number
  ): Promise<HMOEligibilityResponse> {
    const response = await api.get(
      `/patients/${patientId}/hmo-eligibility?serviceType=${serviceType}&serviceAmount=${serviceAmount}`
    );
    return response.data as HMOEligibilityResponse;
  },
};