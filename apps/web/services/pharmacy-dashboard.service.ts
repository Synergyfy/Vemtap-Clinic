import { api } from '@/lib/api';

export interface Drug {
  id: string;
  name: string;
  genericName?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  expiryDate?: string;
  manufacturer?: string;
  supplier?: string;
  isActive: boolean;
  clinicId: string;
  createdAt: string;
}

export interface PaginatedDrugsResponse {
  data: Drug[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransferRequest {
  id: string;
  transferNumber: string;
  type: string;
  status: string;
  fromBranchId?: string;
  toBranchId?: string;
  clinicId: string;
  createdAt: string;
}

export interface PaginatedTransfersResponse {
  data: TransferRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const pharmacyDashboardService = {
  async getDrugs(clinicId: string): Promise<Drug[]> {
    const params = new URLSearchParams({ clinicId, limit: '200' });
    const response = await api.get(`/drugs?${params.toString()}`);
    const data = response.data as PaginatedDrugsResponse;
    return data.data || [];
  },

  async getLowStockDrugs(clinicId: string): Promise<Drug[]> {
    const params = new URLSearchParams({ clinicId });
    const response = await api.get(`/drugs/low-stock?${params.toString()}`);
    const data = response.data as PaginatedDrugsResponse;
    return data.data || [];
  },

  async getPendingDrugTransfers(clinicId: string): Promise<TransferRequest[]> {
    const params = new URLSearchParams({ clinicId, type: 'drug', status: 'requested', limit: '20' });
    const response = await api.get(`/inventory-transfers?${params.toString()}`);
    const data = response.data as PaginatedTransfersResponse;
    return data.data || [];
  },
};
