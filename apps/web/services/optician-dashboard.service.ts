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
  createdAt?: string;
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
  patient?: { id?: string; firstName?: string; lastName?: string };
  clinicId: string;
  createdAt?: string;
}

export interface OpticalSale {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  paymentMethod: string;
  patientId?: string;
  patient?: { id?: string; firstName?: string; lastName?: string };
  lensOrderId?: string;
  clinicId: string;
  createdAt?: string;
}

function normalizeList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

export const opticianDashboardService = {
  async getLensOrders(clinicId: string): Promise<LensOrder[]> {
    const response = await api.get('/optical/lens-orders', { params: { clinicId } });
    return normalizeList<LensOrder>(response.data);
  },

  async getInventory(clinicId: string): Promise<OpticalInventoryItem[]> {
    const response = await api.get('/optical/items', { params: { clinicId } });
    return normalizeList<OpticalInventoryItem>(response.data);
  },

  async getSales(clinicId: string): Promise<OpticalSale[]> {
    const response = await api.get('/optical/sales', { params: { clinicId } });
    return normalizeList<OpticalSale>(response.data);
  },
};
