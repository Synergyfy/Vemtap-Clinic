import { api } from '@/lib/api';

export interface OpticalInventoryItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  type: string;
  frameSize?: string;
  lensType?: string;
  unitPrice: number;
  quantityInStock: number;
  isActive?: boolean;
  clinicId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LensOrder {
  id: string;
  patientId: string;
  patient?: { id?: string; firstName?: string; lastName?: string };
  lensType: string;
  frameDescription?: string;
  rightEyeSphere?: string;
  leftEyeSphere?: string;
  rightEyeCylinder?: string;
  leftEyeCylinder?: string;
  rightEyeAxis?: string;
  leftEyeAxis?: string;
  totalPrice: number;
  status: 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  expectedDeliveryDate?: string | null;
  actualDeliveryDate?: string | null;
  notes?: string;
  clinicId: string;
  createdAt?: string;
}

export interface OpticalSale {
  id: string;
  saleNumber?: string;
  patientId?: string;
  patient?: { id?: string; firstName?: string; lastName?: string };
  inventoryItemId?: string;
  inventoryItem?: { id?: string; name?: string };
  lensOrderId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'completed' | 'refunded' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'transfer' | 'hmo' | 'split';
  paymentReference?: string;
  cashierId?: string;
  clinicId: string;
  createdAt?: string;
}

export interface ProductionItem {
  id: string;
  lensOrderId: string;
  lensOrder?: LensOrder;
  inventoryItemId?: string;
  inventoryItem?: { id?: string; name?: string };
  stage: string;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
  clinicId: string;
}

function normalizeList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

export const opticalInventoryService = {
  getItems: async (clinicId: string): Promise<OpticalInventoryItem[]> => {
    const res = await api.get('/optical/items', { params: { clinicId } });
    return normalizeList<OpticalInventoryItem>(res.data);
  },
  getItem: async (id: string): Promise<OpticalInventoryItem> => {
    const res = await api.get(`/optical/items/${id}`);
    return res.data;
  },
  createItem: async (payload: Partial<OpticalInventoryItem>): Promise<OpticalInventoryItem> => {
    const res = await api.post('/optical/items', payload);
    return res.data;
  },
  updateItem: async (id: string, payload: Partial<OpticalInventoryItem>): Promise<OpticalInventoryItem> => {
    const res = await api.put(`/optical/items/${id}`, payload);
    return res.data;
  },
  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/optical/items/${id}`);
  },
};

export const lensOrderService = {
  getAll: async (clinicId: string): Promise<LensOrder[]> => {
    const res = await api.get('/optical/lens-orders', { params: { clinicId } });
    return normalizeList<LensOrder>(res.data);
  },
  create: async (payload: Partial<LensOrder>): Promise<LensOrder> => {
    const res = await api.post('/optical/lens-orders', payload);
    return res.data;
  },
  getProduction: async (orderId: string): Promise<ProductionItem[]> => {
    const res = await api.get(`/optical/lens-orders/${orderId}/production`);
    return normalizeList<ProductionItem>(res.data);
  },
  createProductionItem: async (payload: { lensOrderId: string; inventoryItemId?: string; clinicId: string }): Promise<ProductionItem> => {
    const res = await api.post('/optical/production', payload);
    return res.data;
  },
  updateStatus: async (orderId: string, payload: { status?: string; actualDeliveryDate?: string; notes?: string }): Promise<LensOrder> => {
    const res = await api.put(`/optical/lens-orders/${orderId}`, payload);
    return res.data;
  },
  updateProductionStage: async (orderId: string, stage: string, notes?: string): Promise<ProductionItem> => {
    const res = await api.put(`/optical/lens-orders/${orderId}/production`, { stage, notes });
    return res.data;
  },
};

export const opticalSalesService = {
  getAll: async (clinicId: string): Promise<OpticalSale[]> => {
    const res = await api.get('/optical/sales', { params: { clinicId } });
    return normalizeList<OpticalSale>(res.data);
  },
  getByLensOrder: async (lensOrderId: string): Promise<OpticalSale[]> => {
    const res = await api.get(`/optical/lens-orders/${lensOrderId}/sales`);
    return normalizeList<OpticalSale>(res.data);
  },
  create: async (payload: Partial<OpticalSale>): Promise<OpticalSale> => {
    const res = await api.post('/optical/sales', payload);
    return res.data;
  },
};
