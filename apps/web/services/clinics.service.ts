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

export interface PlatformOverview {
  stats: {
    totalClinics?: number | null;
    activeClinics?: number | null;
    activeUsers?: number | null;
    monthlyRevenue?: number | null;
    hmoUsage?: string | null;
  };
  recentClinics: {
    id: string;
    name: string;
    city?: string | null;
    email?: string | null;
    phone?: string | null;
    plan?: string | null;
    status?: string | null;
    createdAt?: string | null;
  }[];
  alerts: {
    id: string;
    title: string;
    desc: string;
    time: string;
    type: string;
  }[];
}

export async function getPlatformOverview(): Promise<PlatformOverview> {
  try {
    const { data } = await api.get('/clinics/platform-overview');
    return data;
  } catch {
    try {
      const [statsRes, clinicsRes, ticketsRes, staffRes] = await Promise.allSettled([
        getClinicStats(),
        listClinics(),
        api.get('/support-tickets'),
        api.get('/staff'),
      ]);

      const stats = statsRes.status === 'fulfilled' ? statsRes.value : null;
      const clinics = clinicsRes.status === 'fulfilled' && Array.isArray(clinicsRes.value) ? clinicsRes.value : [];

      const ticketsData = ticketsRes.status === 'fulfilled' ? ticketsRes.value.data : [];
      const ticketsList = Array.isArray(ticketsData?.data) ? ticketsData.data : Array.isArray(ticketsData) ? ticketsData : [];

      const staffData = staffRes.status === 'fulfilled' ? staffRes.value.data : [];
      const staffList = Array.isArray(staffData?.data) ? staffData.data : Array.isArray(staffData) ? staffData : [];

      const alerts = ticketsList.slice(0, 4).map((t: any) => ({
        id: t.id,
        title: t.subject || 'Support Inquiry',
        desc: t.description || `Priority: ${t.priority || 'Medium'} • Category: ${t.category || 'System'}`,
        time: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Active',
        type: t.priority === 'urgent' || t.priority === 'high' ? 'error' : 'warning',
      }));

      return {
        stats: {
          totalClinics: stats?.total ?? (clinics.length > 0 ? clinics.length : null),
          activeClinics: stats?.active ?? (clinics.length > 0 ? clinics.filter(c => c.isActive !== false).length : null),
          activeUsers: staffList.length > 0 ? staffList.length : null,
          monthlyRevenue: null,
          hmoUsage: null,
        },
        recentClinics: clinics.slice(0, 5).map(c => ({
          id: c.id,
          name: c.name,
          city: c.city ?? c.address ?? null,
          email: c.email ?? null,
          phone: c.phone ?? null,
          plan: c.plan ?? null,
          status: c.isActive !== false ? 'Active' : 'Inactive',
          createdAt: c.createdAt ?? null,
        })),
        alerts,
      };
    } catch {
      return {
        stats: {
          totalClinics: null,
          activeClinics: null,
          activeUsers: null,
          monthlyRevenue: null,
          hmoUsage: null,
        },
        recentClinics: [],
        alerts: [],
      };
    }
  }
}
