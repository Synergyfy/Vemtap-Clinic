import { api } from '@/lib/api';

export interface OpticalInventoryItem {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  type?: string;
  frameSize?: string;
  lensType?: string;
  unitPrice: number;
  quantityInStock: number;
  isActive: boolean;
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
  notes?: string;
  patientId: string;
  patient?: { id: string; firstName: string; lastName: string };
  clinicId: string;
  createdAt: string;
}

export interface OpticalSale {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  paymentMethod: string;
  patientId?: string;
  patient?: { id: string; firstName: string; lastName: string };
  lensOrderId?: string;
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

function getPatientName(patient: { firstName: string; lastName: string } | undefined): string {
  if (!patient) return "Unknown Patient";
  return `${patient.firstName} ${patient.lastName}`;
}

export const opticianDashboardService = {
  async getLensOrders(clinicId: string): Promise<LensOrder[]> {
    const params = new URLSearchParams({ clinicId, limit: '100' });
    const response = await api.get(`/optical/lens-orders?${params.toString()}`);
    const data = response.data as PaginatedResponse<LensOrder>;
    return data.data || [];
  },

  async getInventory(clinicId: string): Promise<OpticalInventoryItem[]> {
    const params = new URLSearchParams({ clinicId, limit: '200' });
    const response = await api.get(`/optical/items?${params.toString()}`);
    const data = response.data as PaginatedResponse<OpticalInventoryItem>;
    return data.data || [];
  },

  async getSales(clinicId: string): Promise<OpticalSale[]> {
    const params = new URLSearchParams({ clinicId, limit: '20' });
    const response = await api.get(`/optical/sales?${params.toString()}`);
    const data = response.data as PaginatedResponse<OpticalSale>;
    return data.data || [];
  },
};
