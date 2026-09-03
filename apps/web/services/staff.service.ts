import { api } from '@/lib/api';

export type StaffRole = 
  | 'doctor'
  | 'nurse'
  | 'receptionist'
  | 'pharmacist'
  | 'optometrist'
  | 'cashier'
  | 'lab_technician'
  | 'admin';

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffRole;
  department?: string;
  specialization?: string;
  licenseNumber?: string;
  isActive: boolean;
  clinicId: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedStaffResponse {
  data: Staff[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StaffQueryParams {
  search?: string;
  role?: StaffRole;
  department?: string;
  isActive?: boolean;
  clinicId?: string;
  branchId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateStaffData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffRole;
  department?: string;
  specialization?: string;
  licenseNumber?: string;
  clinicId: string;
  branchId: string;
}

export interface UpdateStaffData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: StaffRole;
  department?: string;
  specialization?: string;
  licenseNumber?: string;
  isActive?: boolean;
  branchId?: string;
}

export interface StaffStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
}

export const staffService = {
  async getAll(params: StaffQueryParams = {}): Promise<PaginatedStaffResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const response = await api.get(`/staff?${searchParams.toString()}`);
    return response.data as PaginatedStaffResponse;
  },

  async getById(id: string): Promise<Staff> {
    const response = await api.get(`/staff/${id}`);
    return response.data as Staff;
  },

  async create(data: CreateStaffData): Promise<Staff> {
    const response = await api.post('/staff', data);
    return response.data as Staff;
  },

  async update(id: string, data: UpdateStaffData): Promise<Staff> {
    const response = await api.put(`/staff/${id}`, data);
    return response.data as Staff;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/staff/${id}`);
  },

  async getStats(clinicId: string): Promise<StaffStats> {
    const response = await api.get(`/staff/stats?clinicId=${clinicId}`);
    return response.data as StaffStats;
  },
};