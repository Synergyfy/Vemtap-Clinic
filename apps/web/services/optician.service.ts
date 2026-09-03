import { api } from '@/lib/api';

export interface OpticalInventoryItem {
  id: string;
  name: string;
  description: string;
  category: 'frame' | 'lens' | 'accessory';
  brand: string;
  model: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  isActive: boolean;
  clinicId: string;
}

export interface LensOrder {
  id: string;
  patientId: string;
  patient?: { firstName: string; lastName: string; };
  lensType: string;
  lensPower: string;
  frameDescription: string;
  totalPrice: number;
  status: 'pending' | 'processing' | 'ready' | 'delivered';
  expectedDeliveryDate: string;
  actualDeliveryDate: string;
  clinicId: string;
  createdAt: string;
}

export interface OpticalSale {
  id: string;
  saleNumber: string;
  patientId: string;
  patient?: { firstName: string; lastName: string; };
  inventoryItemId?: string;
  inventoryItem?: { name: string; };
  lensOrderId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'completed' | 'refunded' | 'cancelled';
  paymentMethod: string;
  cashierId: string;
  clinicId: string;
  createdAt: string;
}

export interface ProductionItem {
  id: string;
  lensOrderId: string;
  lensOrder?: LensOrder;
  inventoryItemId: string;
  inventoryItem?: { name: string; };
  stage: string;
  notes: string;
  technicianId: string;
  startedAt: string;
  completedAt: string;
  clinicId: string;
}

export const opticalInventoryService = {
  getItems: async (clinicId: string): Promise<OpticalInventoryItem[]> => {
    const res = await api.get(`/optical/items?clinicId=${clinicId}`);
    return res.data;
  },
};

export const lensOrderService = {
  getAll: async (clinicId: string): Promise<LensOrder[]> => {
    const res = await api.get(`/optical/lens-orders?clinicId=${clinicId}`);
    return res.data;
  },
  getProduction: async (orderId: string): Promise<ProductionItem[]> => {
    const res = await api.get(`/optical/lens-orders/${orderId}/production`);
    return res.data;
  },
  updateStatus: async (orderId: string, status: string, notes?: string): Promise<LensOrder> => {
    const res = await api.put(`/optical/lens-orders/${orderId}`, { status, notes });
    return res.data;
  },
  updateProductionStage: async (orderId: string, stage: string, notes?: string): Promise<void> => {
    await api.put(`/optical/lens-orders/${orderId}/production`, { stage, notes });
  },
};

export const opticalSalesService = {
  getAll: async (clinicId: string): Promise<OpticalSale[]> => {
    const res = await api.get(`/optical/sales?clinicId=${clinicId}`);
    return res.data;
  },
};
