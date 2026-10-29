import { api } from '@/lib/api';

export interface Clinic {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  website?: string;
  plan?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClinicStats {
  total: number;
  active: number;
  inactive: number;
}

export interface ClinicQueryParams {
  id?: string;
  search?: string;
  isActive?: boolean;
  plan?: string;
}

export interface CreateClinicInput {
  name: string;
  address: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  website?: string;
  plan?: string;
}

export interface UpdateClinicInput {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  website?: string;
  plan?: string;
  isActive?: boolean;
}

export async function listClinics(params: ClinicQueryParams = {}): Promise<Clinic[]> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  const { data } = await api.get(`/clinics${query.toString() ? `?${query.toString()}` : ''}`);
  return data;
}

export async function getClinicStats(): Promise<ClinicStats> {
  const { data } = await api.get('/clinics/stats');
  return data;
}

export async function getClinicById(id: string): Promise<Clinic> {
  const { data } = await api.get(`/clinics/${id}`);
  return data;
}

export async function createClinic(dto: CreateClinicInput): Promise<Clinic> {
  const { data } = await api.post('/clinics', dto);
  return data;
}

export async function updateClinic(id: string, dto: UpdateClinicInput): Promise<Clinic> {
  const { data } = await api.put(`/clinics/${id}`, dto);
  return data;
}

export async function deleteClinic(id: string): Promise<void> {
  await api.delete(`/clinics/${id}`);
}
