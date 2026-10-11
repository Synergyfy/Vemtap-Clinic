import { api } from "@/lib/api";

export interface Drug {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  dosageForm: string;
  strength: string;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  expiryDate?: string;
  manufacturer?: string;
  supplier?: string;
  isActive: boolean;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDrugsResponse {
  data: Drug[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DrugQueryParams {
  clinicId?: string;
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateDrugData {
  name: string;
  genericName?: string;
  category: string;
  dosageForm: string;
  strength: string;
  unitPrice: number;
  quantityInStock?: number;
  reorderLevel?: number;
  expiryDate?: string;
  manufacturer?: string;
  supplier?: string;
  clinicId: string;
}

export interface UpdateDrugData {
  name?: string;
  genericName?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  unitPrice?: number;
  quantityInStock?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface AdjustStockData {
  quantity: number;
}

export async function listDrugs(params: DrugQueryParams = {}): Promise<Drug[]> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const { data } = await api.get(`/drugs?${searchParams.toString()}`);
  return data;
}

export async function getDrug(id: string): Promise<Drug> {
  const { data } = await api.get(`/drugs/${id}`);
  return data;
}

export async function createDrug(dto: CreateDrugData): Promise<Drug> {
  const { data } = await api.post("/drugs", dto);
  return data;
}

export async function updateDrug(id: string, dto: UpdateDrugData): Promise<Drug> {
  const { data } = await api.put(`/drugs/${id}`, dto);
  return data;
}

export async function deleteDrug(id: string): Promise<void> {
  await api.delete(`/drugs/${id}`);
}

export async function getLowStockDrugs(clinicId: string): Promise<Drug[]> {
  const { data } = await api.get("/drugs/low-stock", { params: { clinicId } });
  return data;
}

export async function dispenseDrug(dto: { drugId: string; patientId: string; quantityDispensed: number; clinicId: string; notes?: string }): Promise<any> {
  const { data } = await api.post("/drugs/dispense", dto);
  return data;
}

export async function deductStock(id: string, quantity: number): Promise<Drug> {
  const { data } = await api.post(`/drugs/${id}/deduct`, { quantity });
  return data;
}

export async function restockDrug(id: string, quantity: number): Promise<Drug> {
  const { data } = await api.post(`/drugs/${id}/restock`, { quantity });
  return data;
}